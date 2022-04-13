import type { ChatMessagePayload, TeamMemberPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import slursList from "../presets/slurs.json";
import { Action, ContentFilter, ContentFilterScan, RoleType, Server, Severity } from "../typings";
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

export class ContentFilterUtil extends Util {
    readonly presets = {
        slurs: [
            ...slursList.ban.map(
                (banSlur): ContentFilterScan => ({
                    content: banSlur,
                    infractionPoints: 15,
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

    readonly severityAction: Record<Severity, (message: ChatMessagePayload, server: Server, member: TeamMemberPayload) => unknown> = {
        [Severity.BAN]: (message) => {
            return this.rest.router.banMember(message.serverId!, message.createdBy);
        },
        [Severity.KICK]: (message) => {
            return this.rest.router.kickMember(message.serverId!, message.createdBy);
        },
        [Severity.SOFTBAN]: async (message) => {
            await this.rest.router.banMember(message.serverId!, message.createdBy);
            return this.rest.router.unbanMember(message.serverId!, message.createdBy);
        },
        [Severity.MUTE]: (message, server) => {
            return server.muteRoleId && this.rest.router.assignRoleToMember(message.createdBy, server.muteRoleId);
        },
        [Severity.WARN]: (message, _server, member) => {
            return this.client.messageUtil.send(message.channelId, {
                content: stripIndents`
				**Alert:** ${member.user.name}, you have used a filtered word. 
				This is a warning for you to not use it again, otherwise moderation action will be taken against you.
				`,
                isPrivate: true,
                replyMessageIds: [message.id],
            });
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

    async ifExceedsInfractionThreshold(total: number, server: Server, message: ChatMessagePayload, member: TeamMemberPayload) {
        if (server.banInfractionThreshold && total >= server.banInfractionThreshold) {
            await this.severityAction.BAN(message, server, member);
            return Severity.BAN;
        } else if (server.softbanInfractionThreshold && total >= server.softbanInfractionThreshold) {
            await this.severityAction.SOFTBAN(message, server, member);
            return Severity.SOFTBAN;
        } else if (server.kickInfractionThreshold && total >= server.kickInfractionThreshold) {
            await this.severityAction.KICK(message, server, member);
            return Severity.KICK;
        } else if (server.muteInfractionThreshold && total >= server.muteInfractionThreshold) {
            await this.severityAction.MUTE(message, server, member);
            return Severity.MUTE;
        }
        return null;
    }

    async sendModLogMessage(modLogChannelId: string, createdCase: Action, member: TeamMemberPayload) {
        const msg = await this.client.messageUtil.send(
            modLogChannelId,
            stripIndents`
				**Target:** \`${member.user.name} (${createdCase.targetId})\`
				**Type:** \`${createdCase.type}\`
				**Reason:** \`${createdCase.reason ?? "NO REASON PROVIDED"}\`
				${
                    createdCase.expiresAt
                        ? `**Expiration:** \`${createdCase.expiresAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                          })}\``
                        : ""
                }
			`
        );
        await this.client.serverUtil.populateActionMessage(createdCase.id, msg.message.channelId, msg.message.id);
    }

    async scanMessage(message: ChatMessagePayload, server: Server) {
        if (message.createdByBotId || message.createdByWebhookId || message.createdBy === this.client.userId) return void 0;
        const bannedWordsList = await this.getBannedWords(message.serverId!);
        const enabledPresets = await this.getEnabledPresets(message.serverId!);

        const lowerCasedMessageContent = message.content.toLowerCase();
        const ifTriggersCustom: ContentFilterScan | undefined = bannedWordsList.find((word) =>
            lowerCasedMessageContent.includes(word.content.toLowerCase())
        );
        let ifTriggersPreset: ContentFilterScan | undefined;
        if (!ifTriggersCustom) {
            for (const enabledPreset of enabledPresets) {
                const temp = this.presets[enabledPreset.preset as keyof typeof this.presets].find((word) =>
                    lowerCasedMessageContent.includes(word.content)
                );
                if (temp) {
                    ifTriggersPreset = temp;
                    break;
                }
            }
            if (!ifTriggersPreset) return;
        }
        const triggeredWord = (ifTriggersCustom ?? ifTriggersPreset) as ContentFilterScan;

        const member = await this.client.serverUtil.getMember(message.serverId!, message.createdBy);
        const modRoles = await this.prisma.role.findMany({ where: { serverId: message.serverId, type: RoleType.MOD } });
        if (modRoles.some((modRole) => member.roleIds.includes(modRole.roleId))) return;

        const pastActions = await this.getMemberHistory(message.serverId!, message.createdBy);
        const totalInfractionPoints = ContentFilterUtil.totalAllInfractionPoints(pastActions) + triggeredWord.infractionPoints;
        const modLogChannel = await this.client.serverUtil.getModLogChannel(message.serverId!);
        const ifExceeds = await this.ifExceedsInfractionThreshold(totalInfractionPoints, server, message, member);

        const createdCase = await this.client.serverUtil.addAction({
            serverId: message.serverId!,
            type: ifExceeds ?? triggeredWord.severity,
            executorId: this.client.userId!,
            reason: ifExceeds
                ? `[AUTOMOD] ${ifExceeds} threshold exceeded, used phrase ${triggeredWord.content}`
                : `[AUTOMOD] content filter tripped, used phrase ${triggeredWord.content}`,
            targetId: message.createdBy,
            expiresAt: (ifExceeds ?? triggeredWord.severity) === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
            infractionPoints: triggeredWord.infractionPoints,
        });
        if (modLogChannel) await this.sendModLogMessage(modLogChannel.channelId, createdCase, member);
        await this.rest.router.deleteChannelMessage(message.channelId!, message.id);
        return this.severityAction[triggeredWord.severity]?.(message, server, member);
    }

    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
