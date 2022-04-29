import type { ChatMessagePayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";
import type { Embed } from "@guildedjs/webhook-client";
import Util from "./util";

export class MessageUtil extends Util {
    // Store a message in the database
    // This will either insert a whole new record, or update an existing record
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
                deleted: false,
                deletedAt: null,
            },
            update: {
                content: message.content,
                updatedAt: message.updatedAt,
            },
        });
    }

    // Send a message using either string, embed object, or raw object
    send(channelId: string, content: string | RESTPostChannelMessagesBody | Embed) {
        return this.rest.router.createChannelMessage(channelId, content instanceof Embed ? { embeds: [content.toJSON()]} : content);
    }

    // Reply to a message
    reply(message: ChatMessagePayload, content: string | RESTPostChannelMessagesBody) {
        const opts: RESTPostChannelMessagesBody | string = typeof content === "string" ? { replyMessageIds: [message.id], content } : content;
        return this.rest.router.createChannelMessage(message.channelId, opts);
    }
}
