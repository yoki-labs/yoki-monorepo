import { ContentFilter, FilterMatching } from "@prisma/client";
import { captureException } from "@sentry/node";

import { ContentFilterScan, Server, Severity } from "../typings";
import { Colors } from "../utils/color";
import presets from "../utils/presets";
import { IMAGE_REGEX } from "../utils/util";
import BaseFilterUtil from "./base-filter";
import { ImageFilterUtil } from "./image-filter";

export const transformSeverityStringToEnum = (str: string): Severity | undefined => Severity[str.toUpperCase()];
export enum FilteredContent {
    Message = 0,
    Channel = 1,
    ChannelContent = 2,
    ServerContent = 3,
}

export class ContentFilterUtil extends BaseFilterUtil {
    readonly imageFilterUtil = new ImageFilterUtil(this.client);
    readonly presets = presets;

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
        const split = lowerCasedMessageContent.split(/[ \t\n-.?!,—]/g);
        // Check if any word triggers the content filter (user provided words). Checks if message content includes a word
        const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) => this.tripsFilter(word, split));

        // This will check if the message content contains any words listed in any enabled presets
        let ifTriggersPreset: ContentFilterScan | undefined;
        // ONLY if the content doesn't already violate a custom filter
        if (!ifTriggersCustom) {
            for (const enabledPreset of enabledPresets) {
                // Get the enabled preset list (slurs, etc.)
                const presetPattern = this.presets[enabledPreset.preset as keyof typeof this.presets];
                // Find first word that is matched with preset's regex
                const foundPresetWord = presetPattern.exec(lowerCasedMessageContent);

                if (foundPresetWord !== null) {
                    // if the content does violate a preset, hoist the triggering word
                    ifTriggersPreset = { content: foundPresetWord[0], matching: FilterMatching.WORD, infractionPoints: 5, severity: enabledPreset.severity ?? Severity.WARN };
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

        // Don't moderate bots
        if (member.user.type === "bot") return;

        // Get all the mod roles in this server
        const modRoles = await this.prisma.role.findMany({ where: { serverId } });

        // If the server doesn't have "filterOnMods" setting enabled and a mod violates the filter/preset, ignore
        if (!server.filterOnMods && modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return;

        // Check whether this member exceeds the infraction threshold for this server
        const ifExceeds = await this.getMemberExceedsThreshold(server, userId, triggeredWord.infractionPoints);

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
        } catch (e) {
            captureException(e);
        }

        // Execute the punishing action. If this is a threshold exceeding, execute the punishment associated with the exceeded threshold
        // Otherwise, execute the action associated with this specific filter word or preset entry
        return ifExceeds
            ? this.severityAction[ifExceeds](member.user.id, server, channelId, filteredContent)
            : this.severityAction[triggeredWord.severity]?.(member.user.id, server, channelId, filteredContent);
    }

    tripsFilter(contentFilter: ContentFilter | Omit<ContentFilterScan, "severity">, words: string[]) {
        // return contentFilter.matching === FilterMatching.WORD ? message.includes(contentFilter.content) :
        return words.some((word) => this.matchesFilter(contentFilter, word));
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

    override onUserWarn(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendWarningBlock(
                channelId!,
                `Cannot use that word`,
                `**Alert:** <@${userId}>, you have used a filtered word. This is a warning for you to not use it again, otherwise moderation actions may be taken against you.`,
                undefined,
                { isPrivate: true }
            );
        // TODO: DM user
        return 0;
    }

    override onUserMute(userId: string, _serv: Server, channelId: string | null, filteredContent: FilteredContent) {
        // When channels and messages get filtered
        if (filteredContent < FilteredContent.ChannelContent)
            return this.client.messageUtil.sendValueBlock(
                channelId!,
                `:mute: You have been muted`,
                `**Alert:** <@${userId}>, you have been muted for using filtered word excessively.`,
                Colors.red,
                undefined,
                {
                    isPrivate: true,
                }
            );
        // TODO: DM user
        return 0;
    }
}
