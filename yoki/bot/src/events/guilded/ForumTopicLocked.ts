import { Colors,inlineCode, inlineQuote } from "@yokilabs/util";

import { GEvent, LogChannelType } from "../../typings";

export default {
	execute: async ([forumTopic, ctx]) => {
		const { serverId } = forumTopic;

		// check if there's a log channel channel for message deletions
		const lockedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_locks);
		if (!lockedTopicLogChannel) return void 0;

		const channel = await ctx.channels.fetch(forumTopic.channelId).catch();

		const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

		// send the log channel message with the content/data of the deleted message
		await ctx.messageUtil.sendLog({
			where: lockedTopicLogChannel.channelId,
			title: `Forum Topic Locked`,
			serverId,
			description: `A topic ${inlineQuote(forumTopic.title)} from <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) was locked in [#${channel.name
				}](${channelURL})

			Topic ID: ${inlineCode(forumTopic.id)}
			Channel ID: ${inlineCode(forumTopic.channelId)}
		`,
			color: Colors.red,
			occurred: new Date().toISOString(),
		});

		return void 0;
	}, name: "forumTopicLocked"
} satisfies GEvent<"forumTopicLocked">;
