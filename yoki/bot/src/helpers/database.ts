import type { ChatMessagePayload, ForumTopicPayload } from "@guildedjs/guilded-api-typings";
import type { ContentIgnoreType, FilterMatching, InviteFilter, LogChannel, Prisma, UrlFilter } from "@prisma/client";
import { nanoid } from "nanoid";

import { Action, ContentFilter, LogChannelType, Server } from "../typings";
import { FormatDate } from "../utils/util";
import { Util } from "./util";
// test
export class DatabaseUtil extends Util {
	addWordToFilter(data: Omit<ContentFilter, "id" | "createdAt">) {
		return this.prisma.contentFilter.create({ data });
	}

	removeWordFromFilter(serverId: string, content: string, matching: FilterMatching) {
		return this.prisma.contentFilter.deleteMany({ where: { serverId, content, matching } });
	}

	addUrlToFilter(data: Omit<UrlFilter, "id" | "createdAt">) {
		return this.prisma.urlFilter.create({ data });
	}

	removeUrlFromFilter(serverId: string, domain: string, subdomain?: string, route?: string) {
		return this.prisma.urlFilter.deleteMany({ where: { serverId, domain, subdomain, route } });
	}

	addInviteToFilter(data: Omit<InviteFilter, "id" | "createdAt">) {
		return this.prisma.inviteFilter.create({ data });
	}

	removeInviteFromFilter(serverId: string, targetServerId: string) {
		return this.prisma.inviteFilter.deleteMany({ where: { serverId, targetServerId } });
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

	disablePreset(serverId: string, preset: string) {
		return this.prisma.preset.deleteMany({ where: { serverId, preset } });
	}

	getMessage(channelId: string, messageId: string) {
		return this.prisma.message.findFirst({ where: { messageId, channelId } });
	}

	getForumTopic(channelId: string, forumTopicId: number) {
		return this.prisma.forumTopic.findFirst({ where: { forumTopicId, channelId } });
	}

	getServer(serverId: string, createIfNotExists?: true): Promise<Server>;
	getServer(serverId: string, createIfNotExists: false): Promise<Server | null>;
	async getServer(serverId: string, createIfNotExists = true) {
		return this.prisma.server
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
						formatTimezone: (date: Date) => FormatDate(date, data.timezone ?? "America/New_York"),
					}
					: null
			);
	}

	async getLogChannel(serverId: string, type: LogChannelType) {
		const logChannels = await this.prisma.logChannel.findMany({ where: { serverId, type: { in: [type, LogChannelType.all] } } });
		return logChannels.find((x) => x.type === type) ?? logChannels[0] ?? null;
	}

	async getMultipleLogChannels(serverId: string, types: LogChannelType[]): Promise<LogChannel[]> {
		return this.prisma.logChannel.findMany({ where: { serverId, type: { in: types } } });
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

	storeForumTopic(topic: ForumTopicPayload) {
		return this.prisma.forumTopic.upsert({
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
				isBot: Boolean(topic.createdByWebhookId),
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

	async emitAction(data: Omit<Action, "id" | "referenceId" | "createdAt" | "updatedAt" | "expired" | "logChannelId" | "logChannelMessage">, server: Server) {
		const action = await this.addAction(data);
		this.client.emitter.emit("ActionIssued", action, server, this.client);
		return action;
	}

	addActionFromMessage(message: ChatMessagePayload, data: Pick<Action, "type" | "reason" | "targetId" | "infractionPoints" | "expiresAt">, server: Server) {
		return this.emitAction(
			{
				serverId: message.serverId!,
				executorId: message.createdBy,
				channelId: null,
				triggerContent: null,
				pardoned: false,
				...data,
			},
			server
		);
	}

	populateActionMessage(id: string, channelId: string, messageId: string) {
		return this.prisma.action.update({ where: { id }, data: { logChannelId: channelId, logChannelMessage: messageId } });
	}

	async getChannelIgnore(serverId: string, channelId: string, contentType: ContentIgnoreType) {
		return this.prisma.channelIgnore.findMany({
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
