import type { ChatMessagePayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";

import Util from "./util";

export class MessageUtil extends Util {
    logMessage(message: ChatMessagePayload) {
        return this.prisma.message.upsert({
            where: { messageId: message.id },
            create: {
                messageId: message.id,
                authorId: message.createdBy,
                channelId: message.channelId,
                content: message.content,
                createdAt: message.createdAt,
                embeds: [],
                serverId: message.serverId!,
                updatedAt: message.updatedAt,
                isBot: Boolean(message.createdByBotId ?? message.createdByWebhookId),
            },
            update: {
                content: message.content,
                updatedAt: message.updatedAt,
            },
        });
    }

    getMessage(channelId: string, messageId: string) {
        return this.prisma.message.findFirst({ where: { messageId, channelId } });
    }

    send(channelId: string, content: string | RESTPostChannelMessagesBody) {
        return this.rest.router.createChannelMessage(channelId, content);
    }

    reply(message: ChatMessagePayload, content: string | RESTPostChannelMessagesBody) {
        const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.rest.router.createChannelMessage(message.channelId, opts);
    }
}
