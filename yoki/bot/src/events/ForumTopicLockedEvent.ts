import type { ForumTopicPayload } from "@guildedjs/guilded-api-typings";

import { Context, LogChannelType } from "../typings";
import { inlineCode, inlineQuote } from "../utils/formatters";

export default async (packet: { d: { serverId: string; forumTopic: ForumTopicPayload } }, ctx: Context, verb: string, color: number) => {
	const { forumTopic, serverId } = packet.d;

	// check if there's a log channel channel for message deletions
	const lockedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_locks);
	if (!lockedTopicLogChannel) return void 0;

	const channel = await ctx.channelUtil.getChannel(forumTopic.channelId).catch();

	const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

	// send the log channel message with the content/data of the deleted message
	await ctx.messageUtil.sendLog({
		where: lockedTopicLogChannel.channelId,
		title: `Forum Topic ${verb}`,
		serverId,
		description: `A topic ${inlineQuote(forumTopic.title)} from <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) was ${verb.toLowerCase()} in [#${channel.name
			}](${channelURL})

			Topic ID: ${inlineCode(forumTopic.id)}
			Channel ID: ${inlineCode(forumTopic.channelId)}
		`,
		color,
		occurred: new Date().toISOString(),
	});

	return void 0;
};
