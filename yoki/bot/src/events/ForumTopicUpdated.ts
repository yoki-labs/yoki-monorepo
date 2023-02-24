import type { EmbedField, WSForumTopicUpdated } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import { Context, LogChannelType, Server } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode, inlineQuote } from "../utils/formatters";
import { quoteChangedContent } from "../utils/messages";
import { moderateContent } from "../utils/moderation";

export default async (packet: WSForumTopicUpdated, ctx: Context, server: Server) => {
	const { forumTopic, serverId } = packet.d;

	// get the old message from the database if we logged it before
	const oldContent = await ctx.dbUtil.getForumTopic(forumTopic.channelId, forumTopic.id);
	// if we did log it in the past, update it with the new content (logMessage uses upsert)
	if (oldContent) {
		void ctx.amp.logEvent({ event_type: "FORUM_TOPIC_UPDATE_DB", user_id: forumTopic.createdBy, event_properties: { serverId } });
		await ctx.dbUtil.storeForumTopic(forumTopic);
	}

	// Scanning
	const deletion = () => ctx.rest.delete(`/channels/${forumTopic.channelId}/topics/${forumTopic.id}`);

	await moderateContent(
		ctx,
		server,
		forumTopic.channelId,
		"FORUM_TOPIC",
		FilteredContent.ChannelContent,
		forumTopic.createdBy,
		`${forumTopic.title}\n${forumTopic.content ?? ""}`,
		forumTopic.mentions,
		deletion
	);

	// check if there's a log channel channel for message deletions
	const editedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_edits);
	if (!editedTopicLogChannel) return void 0;

	const channel = await ctx.channelUtil.getChannel(forumTopic.channelId).catch();

	const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

	const contentChanged = oldContent?.content !== forumTopic.content;

	// send the log channel message with the content/data of the deleted message
	await ctx.messageUtil.sendLog({
		where: editedTopicLogChannel.channelId,
		title: "Forum Topic Edited",
		serverId: server.serverId,
		description: `A topic ${inlineQuote(forumTopic.title)} from <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) has been edited in [#${channel.name
			}](${channelURL})

			Topic ID: ${inlineCode(forumTopic.id)}
			Channel ID: ${inlineCode(forumTopic.channelId)}
		`,
		color: Colors.yellow,
		occurred: new Date().toISOString(),
		fields: [
			oldContent?.title !== forumTopic.title && {
				name: "Title Changes",
				value: `${oldContent?.title ? inlineQuote(oldContent?.title) : "Unknown title"} -> ${inlineQuote(forumTopic.title)}`,
			},
			contentChanged && {
				name: "Old Content",
				value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", forumTopic.content),
			},
			contentChanged && {
				name: "New Content",
				value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", oldContent?.content),
			},
		].filter(Boolean) as EmbedField[],
	});

	return void 0;
};
