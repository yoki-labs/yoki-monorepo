import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import type { LogChannel } from "@prisma/client";
import { stripIndents } from "common-tags";

import { Action, ContentFilter, Server, Severity } from "../typings";
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
    readonly severityAction = {
        [Severity.BAN]: (message: ChatMessagePayload) => {
            return this.rest.router.banMember(message.serverId!, message.createdBy);
        },
        [Severity.KICK]: (message: ChatMessagePayload) => {
            return this.rest.router.kickMember(message.serverId!, message.createdBy);
        },
        [Severity.SOFTBAN]: async (message: ChatMessagePayload) => {
            await this.rest.router.banMember(message.serverId!, message.createdBy);
            return this.rest.router.unbanMember(message.serverId!, message.createdBy);
        },
        [Severity.MUTE]: (message: ChatMessagePayload, server: Server) => {
            return server.muteRoleId && this.rest.router.assignRoleToMember(message.createdBy, server.muteRoleId);
        },
        [Severity.WARN]: (message: ChatMessagePayload) => {
            return this.client.messageUtil.send(message.channelId, {
                content: stripIndents`**Alert:** ${message.createdBy}, you have used a filtered word. 
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

    async ifExceedsInfractionThreshold(total: number, server: Server, message: ChatMessagePayload) {
        if (total >= server.banInfractionThreshold) {
            await this.severityAction.BAN(message);
            return Severity.BAN;
        } else if (total >= server.softbanInfractionThreshold) {
            await this.severityAction.SOFTBAN(message);
            return Severity.SOFTBAN;
        } else if (total >= server.kickInfractionThreshold) {
            await this.severityAction.KICK(message);
            return Severity.KICK;
        } else if (total >= server.muteInfractionThreshold) {
            await this.severityAction.MUTE(message, server);
            return Severity.MUTE;
        }
        return null;
    }

    async sendModLogMessage(modLogChannel: LogChannel, createdCase: Action) {
        const msg = await this.client.messageUtil.send(
            modLogChannel.channelId,
            stripIndents`
				**Target:** \`${createdCase.targetId}\`
				**Type:** \`${createdCase.type}\`
				**Reason:** ${createdCase.reason}
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
        if (message.createdByBotId || message.createdByWebhookId) return void 0;
        const bannedWordsList = await this.getBannedWords(message.serverId!);
        const lowerCasedMessageContent = message.content.toLowerCase();
        const ifTriggers = bannedWordsList.find((word) => lowerCasedMessageContent.includes(word.content));
        if (!ifTriggers) return;

        const pastActions = await this.getMemberHistory(message.serverId!, message.createdBy);
        const totalInfractionPoints = ContentFilterUtil.totalAllInfractionPoints(pastActions) + ifTriggers.infractionPoints;
        const modLogChannel = await this.client.serverUtil.getModLogChannel(message.serverId!);
        const ifExceeds = await this.ifExceedsInfractionThreshold(totalInfractionPoints, server, message);

        const createdCase = await this.client.serverUtil.addAction({
            serverId: message.serverId!,
            type: ifExceeds ?? ifTriggers.severity,
            executorId: process.env.BOT_ID,
            reason: ifExceeds
                ? `[AUTOMOD] ${ifExceeds} threshold exceeded, used phrase ${ifTriggers.content}`
                : `[AUTOMOD] content filter tripped, used phrase ${ifTriggers.content}`,
            targetId: message.createdBy,
            expiresAt: (ifExceeds ?? ifTriggers.severity) === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
            infractionPoints: ifTriggers.infractionPoints,
        });
        if (modLogChannel) await this.sendModLogMessage(modLogChannel, createdCase);
        await this.rest.router.deleteChannelMessage(message.channelId!, message.id);
        return this.severityAction[ifTriggers.severity]?.(message, server);
    }

    static totalAllInfractionPoints(actions: Action[]) {
        return actions.reduce((prev, curr) => prev + curr.infractionPoints, 0);
    }
}
