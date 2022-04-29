import Embed from "@guildedjs/embeds";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import slursList from "../presets/slurs.json";
import { Action, CachedMember, ContentFilter, ContentFilterScan, LogChannelType, RoleType, Server, Severity } from "../typings";
import Util from "./util";

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
                    return this.client.messageUtil.send(content!.channelId, {
                        content: stripIndents`
                    		**Alert:** ${member.user.name}, you have used a filtered word.
                    		This is a warning for you to not use it again, otherwise moderation action will be taken against you.
                    	`,
                        isPrivate: true,
                        replyMessageIds: [content!.id],
                    });
                // TODO: DM user
                return 0;
            },
        };

    // check if the amount of points incurred by this user is higher than the allowed threshold for this server
    async ifExceedsInfractionThreshold(total: number, member: CachedMember, server: Server, content: ChatMessagePayload | null, filteredContent: FilteredContent) {
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

        // Run the associated punishment with the exceeded threshold
        if (severity) await this.severityAction[severity](member, server, content, filteredContent);

        return severity;
    }

    async scanMessage(message: ChatMessagePayload, server: Server) {
        return this.scanContent(
            message.createdByBotId || message.createdByWebhookId || message.createdBy,
            message.content,
            FilteredContent.Message,
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
        content: ChatMessagePayload | null,
        server: Server,
        filter: () => any
    ) {
        // If the bot is the one who did this action, ignore.
        if (userId === this.client.userId) return void 0;
        const { serverId } = server;

        // Get all the banned words in this server
        const bannedWordsList = await this.getBannedWords(serverId);
        // Get all the enabled presets in this server
        const enabledPresets = await this.getEnabledPresets(serverId);

        // Sanitize data into standard form
        const lowerCasedMessageContent = text.toLowerCase();
        // Check if any word triggers the content filter (user provided words). Checks if message content includes a word
        const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) => lowerCasedMessageContent.includes(word.content.toLowerCase()));
        let ifTriggersPreset: ContentFilterScan | undefined;
        if (!ifTriggersCustom) {
            for (const enabledPreset of enabledPresets) {
                const presetFilterList = this.presets[enabledPreset.preset as keyof typeof this.presets];
                const temp = presetFilterList.find((word) => lowerCasedMessageContent.includes(word.content.toLowerCase()));
                if (temp) {
                    ifTriggersPreset = temp;
                    break;
                }
            }
        }
        const triggeredWord = (ifTriggersCustom ?? ifTriggersPreset) as ContentFilterScan | undefined;
        if (!triggeredWord) return void 0;
        const member = await this.client.serverUtil.getMember(serverId, userId);
        const modRoles = await this.prisma.role.findMany({ where: { serverId, type: RoleType.MOD } });
        if (!server.filterOnMods && modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return;

        const pastActions = await this.getMemberHistory(serverId, userId);
        const totalInfractionPoints = ContentFilterUtil.totalAllInfractionPoints(pastActions) + triggeredWord.infractionPoints;

        const modLogChannel = await this.client.serverUtil.getLogChannel(serverId, LogChannelType.MOD_ACTION_LOG);
        const ifExceeds = await this.ifExceedsInfractionThreshold(totalInfractionPoints, member, server, content, filteredContent);

        const createdCase = await this.client.serverUtil.addAction({
            serverId,
            type: ifExceeds ?? triggeredWord.severity,
            executorId: this.client.userId!,
            reason: `${ifExceeds ? `[AUTOMOD] ${ifExceeds} threshold exceeded, used phrase:` : `[AUTOMOD] content filter tripped, used phrase:`}`,
            triggerWord: triggeredWord.content,
            targetId: userId,
            expiresAt: (ifExceeds ?? triggeredWord.severity) === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
            infractionPoints: triggeredWord.infractionPoints,
        });

        if (modLogChannel)
            void this.client.serverUtil
                .sendModLogMessage(server.serverId, modLogChannel.channelId, { ...createdCase, reasonMetaData: `||${triggeredWord.content}||` }, member)
                .catch((e) => console.error(`Error posting in modlog channel ${e.message}`));

        try {
            await filter();
        } catch (err: any) {
            if (err instanceof Error) await this.client.errorHandler.send("Error in filtering callback", [new Embed().setDescription(stripIndents`${err.stack}`).setColor("RED")]);
        }

        return this.severityAction[triggeredWord.severity]?.(member, server, content, filteredContent);
    }

    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
