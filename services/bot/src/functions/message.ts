import type { ChatMessagePayload, RESTPostChannelMessagesBody } from "@guildedjs/guilded-api-typings";

import UtilClass from "./UtilClass";

export class MessageUtil extends UtilClass {
    logMessage(message: ChatMessagePayload) {
        return this.prisma.message.create({
            data: {
                authorId: message.createdBy,
                channelId: message.channelId,
                content: message.content,
                createdAt: message.createdAt,
                embeds: [],
                serverId: message.serverId!,
                updatedAt: null,
            },
        });
    }

    send(channelId: string, content: string | RESTPostChannelMessagesBody) {
        return this.rest.router.createChannelMessage(channelId, content);
    }
}
