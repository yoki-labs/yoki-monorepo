import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";
import { Language, Prisma, Severity } from "@prisma/client";
import { nanoid } from "nanoid";

import { Action, ContentFilter, LogChannelType, Server } from "../typings";
import { Util } from "./util";

export class DatabaseUtil extends Util {
    addWordToFilter(data: Omit<ContentFilter, "id" | "createdAt">) {
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

    enablePreset(serverId: string, preset: string, severity: Severity) {
        return this.prisma.preset.create({ data: { serverId, preset, severity } });
    }

    disablePreset(serverId: string, preset: string) {
        return this.prisma.preset.deleteMany({ where: { serverId, preset } });
    }

    getMessage(channelId: string, messageId: string) {
        return this.prisma.message.findFirst({ where: { messageId, channelId } });
    }

    getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
    getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
    getServer(serverId: string, createIfNotExists = true) {
        return this.prisma.server
            .findUnique({ where: { serverId } })
            .then((server) => {
                if (!server && createIfNotExists) return this.createFreshServerInDatabase(serverId);
                return server ?? null;
            })
            .then((data) => (data ? { ...data, getPrefix: () => data.prefix ?? process.env.DEFAULT_PREFIX } : null));
    }

    getLogChannel(serverId: string, type: LogChannelType) {
        return this.prisma.logChannel.findFirst({ where: { serverId, OR: [{ type }, { type: LogChannelType.ALL }] } });
    }

    getLogChannels(serverId: string) {
        return this.prisma.logChannel.findMany({ where: { serverId } });
    }

    getMuteRole(serverId: string) {
        return this.prisma.server.findFirst({ select: { muteRoleId: true }, where: { serverId } });
    }

    createFreshServerInDatabase(serverId: string, data?: Record<string, any>) {
        return this.prisma.server.create({
            data: {
                serverId,
                locale: Language.EN_US,
                premium: null,
                blacklisted: false,
                muteRoleId: null,
                botJoinedAt: null,
                filterEnabled: false,
                kickInfractionThreshold: 20,
                muteInfractionThreshold: 15,
                banInfractionThreshold: 30,
                ...data,
            },
        });
    }

    // Store a message in the database
    // This will either insert a whole new record, or update an existing record
    storeMessage(message: ChatMessagePayload) {
        return this.prisma.message.upsert({
            where: { messageId: message.id },
            create: {
                messageId: message.id,
                authorId: message.createdBy,
                channelId: message.channelId,
                content: message.content,
                createdAt: message.createdAt,
                embeds: message.embeds?.length ? (message.embeds as Prisma.JsonArray) : undefined,
                serverId: message.serverId!,
                updatedAt: message.updatedAt,
                isBot: Boolean(message.createdByBotId ?? message.createdByWebhookId),
                deletedAt: null,
            },
            update: {
                content: message.content,
                updatedAt: message.updatedAt,
                embeds: JSON.stringify(message.embeds),
            },
        });
    }

    addAction(data: Omit<Action, "id" | "referenceId" | "createdAt" | "updatedAt" | "logChannelI" | "expired" | "logChannelId" | "logChannelMessage">) {
        return this.prisma.action.create({
            data: {
                id: nanoid(17),
                createdAt: new Date(),
                updatedAt: null,
                expired: false,
                ...data,
            },
        });
    }

    async addActionFromMessage(message: ChatMessagePayload, data: Pick<Action, "type" | "reason" | "targetId" | "infractionPoints" | "expiresAt">) {
        const action = await this.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            channelId: null,
            triggerContent: null,
            ...data,
        });

        this.client.emitter.emit("ActionIssued", action, this.client);

        return action;
    }

    populateActionMessage(id: string, channelId: string, messageId: string) {
        return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }
}
