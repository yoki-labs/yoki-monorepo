import { GEvent, LogChannelType } from "../../typings";
import { Colors } from "../../utils/color";
import { inlineCode, inlineQuote } from "../../utils/formatters";
import { quoteChangedContent } from "../../utils/messages";

export default {
	execute: async ([forumTopic, ctx]) => {
		const { serverId } = forumTopic;

		await ctx.prisma.forumTopic.deleteMany({ where: { serverId, channelId: forumTopic.channelId, forumTopicId: forumTopic.id } });

		// check if there's a log channel channel for message deletions
		const deletedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_deletions);
		if (!deletedTopicLogChannel) return void 0;

		const channel = await ctx.channels.fetch(forumTopic.channelId).catch();

		const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

		// send the log channel message with the content/data of the deleted message
		await ctx.messageUtil.sendLog({
			where: deletedTopicLogChannel.channelId,
			serverId,
			title: "Forum Topic Removed",
			description: `A topic ${inlineQuote(forumTopic.title)} from <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) was deleted in [#${channel.name
				}](${channelURL})

			Topic ID: ${inlineCode(forumTopic.id)}
			Channel ID: ${inlineCode(forumTopic.channelId)}
		`,
			color: Colors.red,
			occurred: new Date().toISOString(),
			fields: [
				{
					name: "Content",
					value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", forumTopic.content),
				},
			],
		});

		return void 0;
	}, name: "forumTopicDeleted"
} satisfies GEvent<"forumTopicDeleted">;
