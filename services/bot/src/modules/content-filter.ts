import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { Embed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";

import { Util } from "../functions/util";
import slursList from "../presets/slurs.json";
import { Action, CachedMember, ContentFilterScan, RoleType, Server, Severity } from "../typings";

export const transformSeverityStringToEnum = (str: string): Severity | undefined => Severity[str.toUpperCase()];
export enum FilteredContent {
    Message,
    ServerContent,
}

export class ContentFilterUtil extends Util {
    // placeholder until we automate ingesting preset lists dynamically
    readonly presets = {
        slurs: [
            ...slursList.ban.map(
                (banSlur): ContentFilterScan => ({
                    content: banSlur,
                    infractionPoints: 0,
                    severity: Severity.BAN,
                })
            ),
            ...slursList.warn.map(
                (warnSlur): ContentFilterScan => ({
                    content: warnSlur,
                    infractionPoints: 5,
                    severity: Severity.WARN,
                })
            ),
        ],
    };

    // An object mapping the Action type -> Action punishment
    // Easy way for us to organize punishments into reusable code
    readonly severityAction: Record<Severity, (member: CachedMember, server: Server, content: ChatMessagePayload | null, filteredContent: FilteredContent) => unknown | undefined> =
        {
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
            [Severity.WARN]: (member, _serv, content, filteredContent) => {
                if (filteredContent === FilteredContent.Message)
                    return this.client.messageUtil.sendWarningBlock(
                        content!.channelId,
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

    async scanMessage(message: ChatMessagePayload, server: Server) {
        return this.scanContent(
            message.createdByBotId || message.createdByWebhookId || message.createdBy,
            message.content,
            FilteredContent.Message,
            message.channelId,
            message,
            server,
            // Filter
            () => this.rest.router.deleteChannelMessage(message.channelId, message.id)
        );
    }

    // This will scan any conten tthat is piped into it for breaking the content filter or preset list and will apply the associated punishment in the final param as a callback
    async scanContent(
        this: ContentFilterUtil,
        userId: string,
        text: string,
        filteredContent: FilteredContent,
        channelId: string | null,
        content: ChatMessagePayload | null,
        server: Server,
        resultingAction: () => unknown
    ) {
        // If the bot is the one who did this action, ignore.
        if (userId === this.client.userId) return void 0;
        const { serverId } = server;

        // Get all the banned words in this server
        const bannedWordsList = await this.dbUtil.getBannedWords(serverId);
        // Get all the enabled presets in this server
        const enabledPresets = await this.dbUtil.getEnabledPresets(serverId);

        // Sanitize data into standard form
        const lowerCasedMessageContent = text.toLowerCase();
        // Check if any word triggers the content filter (user provided words). Checks if message content includes a word
        const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) => lowerCasedMessageContent.includes(word.content.toLowerCase()));

        // This will check if the message content contains any words listed in any enabled presets
        let ifTriggersPreset: ContentFilterScan | undefined;
        // ONLY if the content doesn't already violate a custom filter
        if (!ifTriggersCustom) {
            for (const enabledPreset of enabledPresets) {
                // Get the enabled preset list (slurs, etc.)
                const presetFilterList = this.presets[enabledPreset.preset as keyof typeof this.presets];
                // Same check as the custom filter one, just checks if the message content contains any words from the preset list
                const temp = presetFilterList.find((word) => lowerCasedMessageContent.includes(word.content.toLowerCase()));
                if (temp) {
                    // if the content does violate a preset, hoist the triggering word
                    ifTriggersPreset = temp;
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
        const modRoles = await this.prisma.role.findMany({ where: { serverId, type: RoleType.MOD } });

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
        this.client.emitter.emit("ActionIssued", createdCase, member, this.client);

        try {
            // Perform resulting action, for message filtering it's deleting the original message
            await resultingAction();
        } catch (err: any) {
            if (err instanceof Error) await this.client.errorHandler.send("Error in filtering callback", [new Embed().setDescription(stripIndents`${err.stack}`).setColor("RED")]);
        }

        // Execute the punishing action. If this is a threshold exceeding, execute the punishment associated with the exceeded threshold
        // Otherwise, execute the action associated with this specific filter word or preset entry
        return ifExceeds
            ? this.severityAction[ifExceeds](member, server, content, filteredContent)
            : this.severityAction[triggeredWord.severity]?.(member, server, content, filteredContent);
    }

    // Total up all infraction points from an array of infractions
    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
