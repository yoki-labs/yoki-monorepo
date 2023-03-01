import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType, Prisma } from "@prisma/client";
import { stripIndents } from "common-tags";
import { Message, UserType } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";
import { Colors } from "../../utils/color";
import { codeBlock, inlineCode } from "../../utils/formatters";

export default {
	execute: async ([message, ctx]) => {
		const isMsgObj = message instanceof Message;
		const narrowedMessage = isMsgObj ? message : message.message;

		// check if there's a log channel channel for message deletions
		const deletedMessageLogChannel = await ctx.dbUtil.getLogChannel(narrowedMessage.serverId!, LogChannelType.message_deletions);
		if (!deletedMessageLogChannel) return void 0;

		// get the database entry for the deleted message
		const deletedMessage = await ctx.dbUtil.getMessage(narrowedMessage.channelId, narrowedMessage.id);

		// mark this message as deleted if it's in the database, that way our runner can clear this message from the database after two weeks
		if (deletedMessage) {
			void ctx.amp.logEvent({ event_type: "MESSAGE_DELETE_DB", user_id: deletedMessage.authorId, event_properties: { serverId: narrowedMessage.serverId! } });
			await ctx.prisma.message.updateMany({ where: { messageId: deletedMessage.messageId }, data: { deletedAt: narrowedMessage.deletedAt } });
		}
		// if there is a database entry for the message, get the member from the server so we can get their name and roles etc.
		const oldMember = deletedMessage ? await ctx.members.fetch(deletedMessage.serverId!, deletedMessage.authorId).catch(() => null) : null;
		if (oldMember?.user?.type === UserType.Bot) return;
		const channel = await ctx.channels.fetch(narrowedMessage.channelId).catch();

		try {
			const logContent = [
				{
					name: "Content",
					value: deletedMessage?.content
						? codeBlock(deletedMessage.content.length > 1012 ? `${deletedMessage.content.slice(0, 1012)}...` : deletedMessage.content)
						: (deletedMessage?.embeds as Prisma.JsonArray)?.length
							? `_This message contains embeds._`
							: `Could not find message content. This message may be older than 14 days.`,
				},
			];

			if (deletedMessage && (deletedMessage?.content.length ?? 0) > 1000) {
				const uploadToBucket = await ctx.s3
					.upload({
						Bucket: process.env.S3_BUCKET,
						Key: `logs/message-delete-${narrowedMessage.serverId}-${narrowedMessage.id}.txt`,
						Body: Buffer.from(stripIndents`
						Content: ${deletedMessage.content}
						------------------------------------
					`),
						ContentType: "text/plain",
						ACL: "public-read",
					})
					.promise();
				logContent[0].value = `This log is too big to display in Guilded. You can find the full log [here](${uploadToBucket.Location})`;
			}

			const author = deletedMessage && oldMember ? `<@${oldMember.user!.id}> (${inlineCode(oldMember.user!.id)})` : "Unknown author";
			const channelURL = `https://guilded.gg/teams/${narrowedMessage.serverId}/channels/${narrowedMessage.channelId}/chat`;
			// send the log channel message with the content/data of the deleted message
			await ctx.messageUtil.sendLog({
				where: deletedMessageLogChannel.channelId,
				serverId: narrowedMessage.serverId!,
				title: "Message Removed",
				description: `A message from ${author} was deleted in [#${channel.name}](${channelURL})
			
					Message ID: ${inlineCode(narrowedMessage.id)}
					Channel ID: ${inlineCode(narrowedMessage.channelId)}
					`,
				color: Colors.red,
				occurred: narrowedMessage.deletedAt instanceof Date ? 
					narrowedMessage.deletedAt!.toISOString() 
					: narrowedMessage.deletedAt!,
				fields: logContent,
			});
		} catch (e) {
			// generate ID for this error, not persisted in database
			const referenceId = nanoid();
			// send error to the error webhook
			if (e instanceof Error) {
				console.error(e);
				void ctx.errorHandler.send("Error in logging message deletion!", [
					new WebhookEmbed()
						.setDescription(
							stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(deletedMessage?.serverId ?? "not cached")}
						Channel: ${inlineCode(narrowedMessage.channelId)}
						User: ${inlineCode(deletedMessage?.authorId ?? "not cached")}
						Error: \`\`\`
						${e.stack ?? e.message}
						\`\`\`
					`
						)
						.setColor("RED"),
				]);
			}
		}
		return void 0;
	}, name: "messageDeleted"
} satisfies GEvent<"messageDeleted">;
