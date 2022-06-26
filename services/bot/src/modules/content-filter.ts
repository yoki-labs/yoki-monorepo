import { Embed } from "@guildedjs/webhook-client";
import { ContentFilter, FilterMatching } from "@prisma/client";
import { stripIndents } from "common-tags";
import { readdirSync } from "fs";
import { join } from "path";

import { Util } from "../functions/util";
import { Action, CachedMember, ContentFilterScan, PresetFile, Server, Severity } from "../typings";
import { IMAGE_REGEX } from "../util";
import { ImageFilterUtil } from "./image-filter";

export const transformSeverityStringToEnum = (str: string): Severity | undefined => Severity[str.toUpperCase()];
export enum FilteredContent {
    Message = 0,
    Channel = 1,
    ChannelContent = 2,
    ServerContent = 3,
}

const presets = (() => {
    const dirPath = join(__dirname, "..", "presets");
    const files = readdirSync(dirPath, { withFileTypes: true });
    const loadedPresets: Record<string, Omit<ContentFilterScan, "severity">[]> = {};
    for (const file of files.filter((x) => x.name.endsWith(".json"))) {
        const preset = require(join(dirPath, file.name)) as PresetFile;
        const presetName = file.name.split(".")[0];

        loadedPresets[presetName] = (Object.keys(preset) as FilterMatching[])
            // Of each matching type get a list of slurs
            .map((matching): Omit<ContentFilterScan, "severity">[] =>
                preset[matching].map((slur) => ({
                    content: slur,
                    infractionPoints: 5,
                    matching,
                }))
            )
            // Throw together the slurs of all times
            .reduce((x, y) => x.concat(y));
        console.log(`Loaded preset ${file.name}`);
    }
    return loadedPresets;
})();

export class ContentFilterUtil extends Util {
    readonly imageFilterUtil = new ImageFilterUtil(this.client);
    readonly presets = presets;

    // An object mapping the Action type -> Action punishment
    // Easy way for us to organize punishments into reusable code
    readonly severityAction: Record<
        Exclude<Severity, "NOTE">,
        (member: CachedMember, server: Server, channelId: string | null, filteredContent: FilteredContent) => unknown | undefined
    > = {
        [Severity.BAN]: (member, server) => {
            return this.rest.router.banMember(server.serverId, member.user.id);
        },
        [Severity.KICK]: (member, server) => {
            return this.rest.router.kickMember(server.serverId, member.user.id);
        },
        [Severity.SOFTBAN]: async (member, server) => {
            await this.rest.router.banMember(server.serverId, member.user.id);
            return this.rest.router.unbanMember(server.serverId, member.user.id);
        },
        [Severity.MUTE]: (member, server) => {
            return server.muteRoleId && this.rest.router.assignRoleToMember(server.serverId, member.user.id, server.muteRoleId);
        },
        [Severity.WARN]: (member, _serv, channelId, filteredContent) => {
            // When channels and messages get filtered
            if (filteredContent < FilteredContent.ChannelContent)
                return this.client.messageUtil.sendWarningBlock(
                    channelId!,
                    `Cannot use that word`,
                    `**Alert:** <@${member.user.id}>, you have used a filtered word. This is a warning for you to not use it again, otherwise moderation actions may be taken against you.`,
                    undefined,
                    { isPrivate: true }
                );
            // TODO: DM user
            return 0;
        },
    };

    // check if the amount of points incurred by this user is higher than the allowed threshold for this server
    ifExceedsInfractionThreshold(total: number, server: Server) {
        // FIXME: Still can be minimized further with a loop or something else
        // Check which threshold is exceeded if any
        const severity =
            server.banInfractionThreshold && total >= server.banInfractionThreshold
                ? Severity.BAN
                : server.softbanInfractionThreshold && total >= server.softbanInfractionThreshold
                ? Severity.SOFTBAN
                : server.kickInfractionThreshold && total >= server.kickInfractionThreshold
                ? Severity.KICK
                : server.muteInfractionThreshold && total >= server.muteInfractionThreshold
                ? Severity.MUTE
                : null;
        return severity;
    }

    async scanMessageMedia({ channelId, messageId, userId, content }: { channelId: string; messageId: string; userId: string; content: string }): Promise<void> {
        const matches = [...content.matchAll(IMAGE_REGEX)];
        if (!matches.length) return;
        console.log(userId);
        for (const [_, url] of matches) {
            const result = await this.imageFilterUtil.scanImage(url).catch(() => void 0);
            if (result) {
                this.client.rest.router.deleteChannelMessage(channelId, messageId).catch(() => null);
                await this.client.messageUtil.sendWarningBlock(
                    channelId,
                    "Inappropriate Image!",
                    `<@${userId}>, our filters have detected that an image attached to your message is inappropriate and has been deleted.`,
                    undefined,
                    { isPrivate: true }
                );
                return;
            }
        }
    }

    // This will scan any conten tthat is piped into it for breaking the content filter or preset list and will apply the associated punishment in the final param as a callback
    async scanContent({
        userId,
        text,
        filteredContent,
        channelId,
        server,
        resultingAction,
    }: {
        userId: string;
        text: string;
        filteredContent: FilteredContent;
        channelId: string | null;
        server: Server;
        resultingAction: () => unknown;
    }) {
        // If the bot is the one who did this action, ignore.
        if (userId === this.client.userId) return void 0;
        const { serverId } = server;

        // Get all the banned words in this server
        const bannedWordsList = await this.dbUtil.getBannedWords(serverId);
        // Get all the enabled presets in this server
        const enabledPresets = await this.dbUtil.getEnabledPresets(serverId);

        // Sanitize data into standard form
        const lowerCasedMessageContent = text.toLowerCase();
        const split = lowerCasedMessageContent.split(/[ \t\n-.,—]/g);
        // Check if any word triggers the content filter (user provided words). Checks if message content includes a word
        const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) => this.tripsFilter(word, lowerCasedMessageContent, split));

        // This will check if the message content contains any words listed in any enabled presets
        let ifTriggersPreset: ContentFilterScan | undefined;
        // ONLY if the content doesn't already violate a custom filter
        if (!ifTriggersCustom) {
            for (const enabledPreset of enabledPresets) {
                // Get the enabled preset list (slurs, etc.)
                const presetFilterList = this.presets[enabledPreset.preset as keyof typeof this.presets];
                // Same check as the custom filter one, just checks if the message content contains any words from the preset list
                const temp = presetFilterList.find((word) => this.tripsFilter(word, lowerCasedMessageContent, split));
                if (temp) {
                    // if the content does violate a preset, hoist the triggering word
                    ifTriggersPreset = { ...temp, severity: enabledPreset.severity ?? Severity.WARN };
                    break;
                }
            }
        }

        // Get the triggering word from either a custom filter or from a preset
        const triggeredWord = (ifTriggersCustom ?? ifTriggersPreset) as ContentFilterScan | undefined;

        // If the content does not violate any filters or presets, ignore
        if (!triggeredWord) return void 0;

        // By now, we assume the member has violated a filter or preset
        // Get the member from cache or API
        const member = await this.client.serverUtil.getMember(serverId, userId);

        // Get all the mod roles in this server
        const modRoles = await this.prisma.role.findMany({ where: { serverId } });

        // If the server doesn't have "filterOnMods" setting enabled and a mod violates the filter/preset, ignore
        if (!server.filterOnMods && modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return;

        // Get this member's past infraction history
        const pastActions = await this.dbUtil.getMemberHistory(serverId, userId);

        // Total up all the infraction points from all these infractions
        const totalInfractionPoints = ContentFilterUtil.totalAllInfractionPoints(pastActions) + triggeredWord.infractionPoints;

        // Check whether this member exceeds the infraction threshold for this server
        const ifExceeds = await this.ifExceedsInfractionThreshold(totalInfractionPoints, server);

        // Add this action to the database
        const createdCase = await this.client.dbUtil.addAction({
            serverId,
            // Whether this action is a result of the threshold exceeding or a severity
            type: ifExceeds ?? triggeredWord.severity,
            // The bot ID
            executorId: this.client.userId!,
            // The reason for this action, whether it's the threshold exceeded or a filter was violated
            reason: `${ifExceeds ? `[AUTOMOD] ${ifExceeds} threshold exceeded, used phrase:` : `[AUTOMOD] content filter tripped, used phrase:`}`,
            // The offending content
            triggerContent: triggeredWord.content,
            // The place where unmute messages will happen
            channelId,
            // The offending user
            targetId: userId,
            // Whether this case will expire (mutes)
            expiresAt: (ifExceeds ?? triggeredWord.severity) === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
            // The amount of infraction points this specific word gives
            infractionPoints: triggeredWord.infractionPoints,
        });

        // If a modlog channel is set
        this.client.emitter.emit("ActionIssued", { ...createdCase, reasonMetaData: `||${triggeredWord.content}||` }, this.client);

        try {
            // Perform resulting action, for message filtering it's deleting the original message
            await resultingAction();
        } catch (err: any) {
            if (err instanceof Error) await this.client.errorHandler.send("Error in filtering callback", [new Embed().setDescription(stripIndents`${err.stack}`).setColor("RED")]);
        }

        // Execute the punishing action. If this is a threshold exceeding, execute the punishment associated with the exceeded threshold
        // Otherwise, execute the action associated with this specific filter word or preset entry
        return ifExceeds
            ? this.severityAction[ifExceeds](member, server, channelId, filteredContent)
            : this.severityAction[triggeredWord.severity]?.(member, server, channelId, filteredContent);
    }

    tripsFilter(contentFilter: ContentFilter | Omit<ContentFilterScan, "severity">, message: string, words: string[]) {
        return contentFilter.matching === FilterMatching.PHRASE ? message.includes(contentFilter.content) : words.some((word) => this.matchesFilter(contentFilter, word));
    }

    matchesFilter(contentFilter: ContentFilter | Omit<ContentFilterScan, "severity">, phrase: string) {
        // word -> *word* -> *word => word*
        return contentFilter.matching === FilterMatching.WORD
            ? phrase === contentFilter.content
            : contentFilter.matching === FilterMatching.INFIX
            ? phrase.includes(contentFilter.content)
            : contentFilter.matching === FilterMatching.POSTFIX
            ? phrase.endsWith(contentFilter.content)
            : phrase.startsWith(contentFilter.content);
    }

    // Total up all infraction points from an array of infractions
    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
