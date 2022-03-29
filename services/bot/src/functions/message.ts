import { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { PrismaClient } from "@prisma/client";

export const logMessage = (prisma: PrismaClient, message: ChatMessagePayload) =>
    prisma.message.create({
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
