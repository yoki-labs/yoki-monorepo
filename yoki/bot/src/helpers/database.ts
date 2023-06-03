import type { ContentIgnoreType, FilterMatching, InviteFilter, LogChannel, UrlFilter } from "@prisma/client";
import { Util, formatDate } from "@yokilabs/bot";
import type { ForumTopic, Message } from "guilded.js";
import { nanoid } from "nanoid";

import type YokiClient from "../Client";
import { Action, ContentFilter, LogChannelType, Server } from "../typings";
// import { Util } from "./util";

// test 2
export class DatabaseUtil extends Util<YokiClient> {
    addWordToFilter(data: Omit<ContentFilter, "id" | "createdAt">) {
        return this.client.prisma.contentFilter.create({ data });
    }

    removeWordFromFilter(serverId: string, content: string, matching: FilterMatching) {
        return this.client.prisma.contentFilter.deleteMany({ where: { serverId, content, matching } });
    }

    addUrlToFilter(data: Omit<UrlFilter, "id" | "createdAt">) {
        return this.client.prisma.urlFilter.create({ data });
    }

    removeUrlFromFilter(serverId: string, domain: string, subdomain?: string, route?: string) {
        return this.client.prisma.urlFilter.deleteMany({ where: { serverId, domain, subdomain, route } });
    }

    addInviteToFilter(data: Omit<InviteFilter, "id" | "createdAt">) {
        return this.client.prisma.inviteFilter.create({ data });
    }

    removeInviteFromFilter(serverId: string, targetServerId: string) {
        return this.client.prisma.inviteFilter.deleteMany({ where: { serverId, targetServerId } });
    }

    getBannedWords(serverId: string) {
        return this.client.prisma.contentFilter.findMany({ where: { serverId } });
    }

    getMemberHistory(serverId: string, targetId: string) {
        return this.client.prisma.action.findMany({ where: { targetId, serverId } });
    }

    enableFilter(serverId: string) {
        return this.client.prisma.server.updateMany({ data: { filterEnabled: true }, where: { serverId } });
    }

    disableFilter(serverId: string) {
        return this.client.prisma.server.updateMany({ data: { filterEnabled: false }, where: { serverId } });
    }

    getEnabledPresets(serverId: string) {
        return this.client.prisma.preset.findMany({ where: { serverId } });
    }

    disablePreset(serverId: string, preset: string) {
        return this.client.prisma.preset.deleteMany({ where: { serverId, preset } });
    }

    getMessage(channelId: string, messageId: string) {
        return this.client.prisma.message.findFirst({ where: { messageId, channelId } });
    }

    getForumTopic(channelId: string, forumTopicId: number) {
        return this.client.prisma.forumTopic.findFirst({ where: { forumTopicId, channelId } });
    }

    getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
    getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
    getServer(serverId: string, createIfNotExists = true) {
        return this.client.prisma.server
            .findUnique({ where: { serverId } })
            .then((server) => {
                if (!server && createIfNotExists) return this.createFreshServerInDatabase(serverId);
                return server ?? null;
            })
            .then((data) =>
                data
                    ? {
                          ...data,
                          getPrefix: () => data.prefix ?? process.env.DEFAULT_PREFIX,
                          getTimezone: () => data.timezone ?? "America/New_York",
                          formatTimezone: (date: Date) => formatDate(date, data.timezone ?? "America/New_York"),
                      }
                    : null
            );
    }

    async getLogChannel(serverId: string, type: LogChannelType) {
        const logChannels = await this.client.prisma.logChannel.findMany({ where: { serverId, type: { in: [type, LogChannelType.all] } } });
        return logChannels.find((x) => x.type === type) ?? logChannels[0] ?? null;
    }

    getMultipleLogChannels(serverId: string, types: LogChannelType[]): Promise<LogChannel[]> {
        return this.client.prisma.logChannel.findMany({ where: { serverId, type: { in: types } } });
    }

    getLogChannels(serverId: string) {
        return this.client.prisma.logChannel.findMany({ where: { serverId } });
    }

    getMuteRole(serverId: string) {
        return this.client.prisma.server.findFirst({ select: { muteRoleId: true }, where: { serverId } });
    }

    createFreshServerInDatabase(serverId: string, data?: Record<string, any>) {
        return this.client.prisma.server.create({
            data: {
                serverId,
                locale: "en-US",
                premium: null,
                blacklisted: false,
                muteRoleId: null,
                botJoinedAt: null,
                filterEnabled: false,
                modmailGroupId: null,
                kickInfractionThreshold: 20,
                muteInfractionThreshold: 15,
                banInfractionThreshold: 30,
                ...data,
            },
        });
    }

    // Store a message in the database
    // This will either insert a whole new record, or update an existing record
    storeMessage(message: Message) {
        return this.client.prisma.message.upsert({
            where: { messageId: message.id },
            create: {
                messageId: message.id,
                authorId: message.authorId,
                channelId: message.channelId,
                content: message.content,
                createdAt: message.createdAt,
                embeds: [],
                serverId: message.serverId!,
                updatedAt: message.updatedAt,
                isBot: Boolean(message.createdByWebhookId),
                deletedAt: null,
            },
            update: {
                content: message.content,
                updatedAt: message.updatedAt,
            },
        });
    }

    storeForumTopic(topic: ForumTopic) {
        return this.client.prisma.forumTopic.upsert({
            where: { forumTopicId: topic.id },
            create: {
                forumTopicId: topic.id,
                authorId: topic.createdBy,
                channelId: topic.channelId,
                title: topic.title!,
                content: topic.content!,
                createdAt: topic.createdAt,
                embeds: undefined,
                serverId: topic.serverId!,
                updatedAt: undefined,
                isBot: false,
                deletedAt: null,
            },
            update: {
                title: topic.title,
                content: topic.content,
                updatedAt: undefined,
                embeds: undefined,
            },
        });
    }

    addAction(data: Omit<Action, "id" | "referenceId" | "createdAt" | "updatedAt" | "expired" | "logChannelId" | "logChannelMessage" | "pardoned">) {
        return this.client.prisma.action.create({
            data: {
                id: nanoid(17),
                createdAt: new Date(),
                updatedAt: null,
                expired: false,
                ...data,
            },
        });
    }

    async emitAction(data: Omit<Action, "id" | "referenceId" | "createdAt" | "updatedAt" | "expired" | "logChannelId" | "logChannelMessage">, server: Server) {
        const action = await this.addAction(data);
        this.client.emitter.emit("ActionIssued", action, server, this.client);
        return action;
    }

    addActionFromMessage(message: Message, data: Pick<Action, "type" | "reason" | "targetId" | "infractionPoints" | "expiresAt">, server: Server) {
        return this.emitAction(
            {
                serverId: message.serverId!,
                executorId: message.authorId,
                channelId: null,
                triggerContent: null,
                pardoned: false,
                ...data,
            },
            server
        );
    }

    populateActionMessage(id: string, channelId: string, messageId: string) {
        return this.client.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
    }

    getChannelIgnore(serverId: string, channelId: string, contentType: ContentIgnoreType) {
        return this.client.prisma.channelIgnore.findMany({
            where: {
                serverId,
                OR: [
                    {
                        contentType,
                    },
                    {
                        channelId,
                    },
                ],
            },
        });
    }
}
