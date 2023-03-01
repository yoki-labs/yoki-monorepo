import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { FilteredContent } from "../../modules/content-filter";
import type { Context, Server } from "../../typings";
import { Colors } from "../../utils/color";
import { inlineCode, quoteMarkdown } from "../../utils/formatters";
import { moderateContent } from "../../utils/moderation";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context, server: Server) => {
	const { message } = packet.d;

	// if this message isn't updated in a server, or if the author is a bot, ignore
	if (message.authorIdBotId || message.authorId === ctx.userId || message.authorId === "Ann6LewA" || !message.serverId) return void 0;
	void ctx.amp.logEvent({ event_type: "MESSAGE_UPDATE", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

	const member = await ctx.members.fetch(packet.d.serverId, packet.d.message.authorId).catch(() => null);
	if (member?.user.type === UserType.Bot) return;

	// get the old message from the database if we logged it before
	const oldMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);
	// if we did log it in the past, update it with the new content (logMessage uses upsert)
	if (oldMessage) {
		void ctx.amp.logEvent({ event_type: "MESSAGE_UPDATE_DB", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
		await ctx.dbUtil.storeMessage(message);
	}

	// scan the updated message content
	await moderateContent(ctx, server, message.channelId, "MESSAGE", FilteredContent.Message, message.authorId, message.content, message.mentions, () =>
		ctx.messages.delete(message.channelId, message.id)
	);

	// get the log channel for message updates
	const updatedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.message_edits);
	// if there is no log channel for message updates, then ignore
	if (!updatedMessageLogChannel) return void 0;

	try {
		let logContent = [
			{
				name: `Old Content`,
				value: oldMessage
					? oldMessage.content
						? quoteMarkdown(oldMessage.content, 1012)
						: `This message does not contain text content.`
					: `Could not find old version of this message.`,
			},
			{
				name: `New Content`,
				value: message.content ? quoteMarkdown(message.content, 1012) : `This message does not contain text content.`,
			},
		];
		if ((oldMessage?.content.length ?? 0) > 1000 || message.content.length > 1000) {
			const uploadToBucket = await ctx.s3
				.upload({
					Bucket: process.env.S3_BUCKET,
					Key: `logs/message-update-${message.serverId}-${message.id}.txt`,
					Body: Buffer.from(stripIndents`
						Old: ${oldMessage?.content ?? "None"}
						------------------------------------
						New: ${message.content}
					`),
					ContentType: "text/plain",
					ACL: "public-read",
				})
				.promise();
			logContent = [
				{
					name: "Message Log",
					value: `This log is too big to display in Guilded. You can find the full log [here](${uploadToBucket.Location})`,
				},
			];
		}

		const author = message.authorIdWebhookId ? `Webhook (${inlineCode(message.authorIdWebhookId)})` : `<@${message.authorId}> (${inlineCode(message.authorId)})`;
		const channel = await ctx.channels.fetch(message.channelId);

		const channelURL = `https://guilded.gg/teams/${message.serverId}/channels/${message.channelId}/chat`;
		// send embed in log channel
		await ctx.messageUtil.sendLog({
			where: updatedMessageLogChannel.channelId,
			title: `Message Edited`,
			serverId: server.serverId,
			description: stripIndents`
                ${author} has edited a message in the channel [#${channel.name}](${channelURL}).

				Message ID: ${inlineCode(message.id)}
				Channel ID: ${inlineCode(message.channelId)}

                [Jump to the message](${channelURL}?messageId=${message.id})
            `,
			color: Colors.yellow,
			occurred: message.updatedAt!,
			fields: logContent,
		});
	} catch (e) {
		const referenceId = nanoid();
		if (e instanceof Error) {
			console.error(e);
			void ctx.errorHandler.send("Error in logging message update!", [
				new WebhookEmbed()
					.setDescription(
						stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(message.serverId)}
						Channel: ${inlineCode(message.channelId)}
						User: ${inlineCode(message.authorId)}
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
};
