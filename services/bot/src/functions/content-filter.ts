import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { ContentFilter, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";

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
    addWordToFilter(data: Omit<ContentFilter, "id">) {
        return this.prisma.contentFilter.create({ data });
    }

    removeWordFromFilter(serverId: string, content: string) {
        return this.prisma.contentFilter.deleteMany({ where: { serverId, content } });
    }

    getBannedWords(serverId: string) {
        return this.prisma.contentFilter.findMany({ where: { serverId } });
    }

    enableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: true }, where: { serverId } });
    }

    disableFilter(serverId: string) {
        return this.prisma.server.updateMany({ data: { filterEnabled: false }, where: { serverId } });
    }

    async scanMessage(message: ChatMessagePayload) {
        if (message.createdByBotId || message.createdByWebhookId) return void 0;
        const bannedWordsList = await this.getBannedWords(message.serverId!);
        const ifTriggers = bannedWordsList.find((word) => message.content.includes(word.content));
        if (!ifTriggers) return;
        const createdCase = await this.client.serverUtil.addAction({
            serverId: message.serverId!,
            type: ifTriggers.severity,
            executorId: process.env.BOT_ID,
            reason: `[AUTOMOD] content filter tripped, used word \`${ifTriggers.content}\``,
            targetId: message.createdBy,
            expiresAt: ifTriggers.severity === Severity.MUTE ? new Date(Date.now() + 1000 * 60 * 60 * 12) : null,
        });
        const modLogChannel = await this.client.serverUtil.getModLogChannel(message.serverId!);
        if (modLogChannel) {
            const msg = await this.client.messageUtil.send(
                modLogChannel.channelId,
                stripIndents`
			**Target:** \`${message.createdBy}\`
			**Type:** \`${ifTriggers.severity}\`
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
        await this.rest.router.deleteChannelMessage(message.channelId!, message.id);
        switch (ifTriggers.severity) {
            case Severity.BAN: {
                return this.rest.router.banMember(message.serverId!, message.createdBy);
            }
            case Severity.KICK: {
                return this.rest.router.kickMember(message.serverId!, message.createdBy);
            }
            case Severity.MUTE: {
                // pass
                return void 0;
            }
            case Severity.SOFTBAN: {
                await this.rest.router.banMember(message.serverId!, message.createdBy);
                return this.rest.router.unbanMember(message.serverId!, message.createdBy);
            }
            case Severity.WARN: {
                return this.client.messageUtil.send(message.channelId, {
                    content: stripIndents`**Alert:** ${message.createdBy}, you have used a filtered word. 
					This is a warning for you to not use it again, otherwise moderation action will be taken against you.
					`,
                    replyMessageIds: [message.id],
                });
            }
        }
    }
}
