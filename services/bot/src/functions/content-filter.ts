import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import slursList from "../presets/slurs.json";
import { Action, CachedMember, ContentFilter, ContentFilterScan, RoleType, Server, Severity } from "../typings";
import Util from "./util";

export const options = {
    kick: Severity.KICK,
    ban: Severity.BAN,
    mute: Severity.MUTE,
    softban: Severity.SOFTBAN,
    warn: Severity.WARN,
} as const;
export const optionKeys = Object.keys(options);
export const transformSeverityStringToEnum = (str: string) => options[str] as Severity;

export enum FilteredContent {
    Message,
    ServerContent,
}

export class ContentFilterUtil extends Util {
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

    readonly severityAction: Record<
        Severity,
        (userId: string, serverId: string, member: CachedMember, server: Server, content: ChatMessagePayload | null, filteredContent: FilteredContent) => unknown | undefined
    > = {
        [Severity.BAN]: (userId, serverId) => {
            return this.rest.router.banMember(serverId, userId);
        },
        [Severity.KICK]: (userId, serverId) => {
            return this.rest.router.kickMember(serverId, userId);
        },
        [Severity.SOFTBAN]: async (userId, serverId) => {
            await this.rest.router.banMember(serverId, userId);
            return this.rest.router.unbanMember(serverId, userId);
        },
        [Severity.MUTE]: (userId, _sId, _cnt, server) => {
            return server.muteRoleId && this.rest.router.assignRoleToMember(userId, server.muteRoleId);
        },
        [Severity.WARN]: (_uId, _sId, member, _serv, content, filteredContent) => {
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

    addWordToFilter(data: Omit<ContentFilter, "id">) {
        return this.prisma.contentFilter.create({ data });
    }

    removeWordFromFilter(serverId: string, content: string) {
        return this.prisma.contentFilter.deleteMany({ where: { serverId, content } });
    }

    getBannedWords(serverId: string) {
        return this.prisma.contentFilter.findMany({ where: { serverId } });
    }

    getMemberHistory(serverId: string, targetId: string) {
        return this.prisma.action.findMany({ where: { targetId, serverId } });
    }

    enableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: true }, where: { serverId } });
    }

    disableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: false }, where: { serverId } });
    }

    getEnabledPresets(serverId: string) {
        return this.prisma.preset.findMany({ where: { serverId } });
    }

    enablePreset(serverId: string, preset: string) {
        return this.prisma.preset.create({ data: { serverId, preset } });
    }

    disablePreset(serverId: string, preset: string) {
        return this.prisma.preset.deleteMany({ where: { serverId, preset } });
    }

    async ifExceedsInfractionThreshold(
        total: number,
        userId: string,
        serverId: string,
        member: CachedMember,
        server: Server,
        content: ChatMessagePayload | null,
        filteredContent: FilteredContent
    ) {
        // FIXME: Still can be minimized further with a loop or something else
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

        if (severity) await this.severityAction[severity](userId, serverId, member, server, content, filteredContent);

        return severity;
    }

    async scanMessage(message: ChatMessagePayload, server: Server) {
        return this.scanContent(
            message.serverId!,
            message.createdByBotId || message.createdByWebhookId || message.createdBy,
            message.content,
            FilteredContent.Message,
            message,
            server,
            // Filter
            () => this.rest.router.deleteChannelMessage(message.channelId, message.id)
        );
    }

    async scanContent(
        this: ContentFilterUtil,
        serverId: string,
        userId: string,
        text: string,
        filteredContent: FilteredContent,
        content: ChatMessagePayload | null,
        server: Server,
        filter: () => any
    ) {
        if (userId === this.client.userId) return void 0;
        const bannedWordsList = await this.getBannedWords(serverId);
        const enabledPresets = await this.getEnabledPresets(serverId);

        const lowerCasedMessageContent = text.toLowerCase();
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
        const modLogChannel = await this.client.serverUtil.getModLogChannel(serverId);
        const ifExceeds = await this.ifExceedsInfractionThreshold(totalInfractionPoints, userId, serverId, member, server, content, filteredContent);

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

        if (modLogChannel) await this.client.serverUtil.sendModLogMessage(modLogChannel.channelId, { ...createdCase, reasonMetaData: `||${triggeredWord.content}||` }, member);

        filter();

        return this.severityAction[triggeredWord.severity]?.(userId, serverId, member, server, content, filteredContent);
    }

    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
