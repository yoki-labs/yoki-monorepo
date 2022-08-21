import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode, quoteMarkdown } from "../utils/formatters";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context, server: Server) => {
    const { message } = packet.d;
    // if this message isn't updated in a server, or if the author is a bot, ignore
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;
    const member = await ctx.serverUtil.getMember(packet.d.serverId, packet.d.message.createdBy).catch(() => null);
    if (member?.user.type === "bot") return;

    // scan the updated message content
    await ctx.contentFilterUtil.scanContent({
        userId: message.createdByBotId || message.createdByWebhookId || message.createdBy,
        text: message.content,
        filteredContent: FilteredContent.Message,
        channelId: message.channelId,
        server,
        // Filter
        resultingAction: () => ctx.rest.router.deleteChannelMessage(message.channelId, message.id),
    });
    // get the log channel for message updates
    const updatedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.message_edits);
    // if there is no log channel for message updates, then ignore
    if (!updatedMessageLogChannel) return void 0;
    // get the old message from the database if we logged it before
    const oldMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);
    // if we did log it in the past, update it with the new content (logMessage uses upsert)
    if (oldMessage) await ctx.dbUtil.storeMessage(message);

    try {
        let logContent = [
            {
                name: `Old Message`,
                value: oldMessage
                    ? oldMessage.content
                        ? quoteMarkdown(oldMessage.content, 1012)
                        : `This message does not contain text content.`
                    : `Could not find old version of this message.`,
            },
            {
                name: `New message`,
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

        const author = message.createdByWebhookId ? `Webhook (${inlineCode(message.createdByWebhookId)})` : `<@${message.createdBy}> (${inlineCode(message.createdBy)})`;

        // send embed in log channel
        await ctx.messageUtil.sendLog({
            where: updatedMessageLogChannel.channelId,
            title: `Message Edited`,
            description: stripIndents`
                ${author} has edited the message ${inlineCode(message.id)} in the channel ${inlineCode(message.channelId)}.

                [Jump to the message](https://guilded.gg/teams/${message.serverId}/channels/${message.channelId}/chat?messageId=${message.id})
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
						User: ${inlineCode(message.createdBy)}
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
