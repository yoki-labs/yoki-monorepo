import { LogChannelType } from "@prisma/client";
import { inlineCode, quoteMarkdown } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Message, UserType } from "guilded.js";

import YokiClient from "../../Client";
import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";
import { moderateContent } from "../../utils/moderation";
import { uploadS3 } from "../../utils/s3";

export default {
    execute: async ([message, _oldMessage, ctx]) => {
        const server = await ctx.dbUtil.getServer(message.serverId!);

        // if this message isn't updated in a server, or if the author is a bot, ignore
        if (message.author?.type === UserType.Bot || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return;
        void ctx.amp.logEvent({ event_type: "MESSAGE_UPDATE", user_id: message.createdById, event_properties: { serverId: message.serverId! } });

        const member = await ctx.members.fetch(message.serverId, message.authorId).catch(() => null);
        if (member?.user?.type === UserType.Bot) return;

        // get the old message from the database if we logged it before
        const oldMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);
        // if we did log it in the past, update it with the new content (logMessage uses upsert)
        if (oldMessage) {
            void ctx.amp.logEvent({ event_type: "MESSAGE_UPDATE_DB", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
            await ctx.dbUtil.storeMessage(message);
        }

        // scan the updated message content
        await moderateContent(ctx, server, message.channelId, "MESSAGE", FilteredContent.Message, message.authorId, member?.roleIds ?? [], message.content, message.mentions, () =>
            ctx.messages.delete(message.channelId, message.id)
        );

        // get the log channel for message updates
        const updatedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.message_edits);
        // if there is no log channel for message updates, then ignore
        if (!updatedMessageLogChannel) return;

        const contentFields = await getDisplayedContent(ctx, _oldMessage, message);

        const author = message.createdByWebhookId ? `Webhook (${inlineCode(message.createdByWebhookId)})` : `<@${message.authorId}> (${inlineCode(message.authorId)})`;
        const channel = await ctx.channels.fetch(message.channelId);

        const channelURL = `https://guilded.gg/teams/${message.serverId}/channels/${message.channelId}/chat`;
        // send embed in log channel
        await ctx.messageUtil.sendLog({
            where: updatedMessageLogChannel.channelId,
            title: `Message Edited`,
            serverId: server.serverId,
            description: stripIndents`
                ${author} has edited a message in the channel [#${channel.name}](${channelURL}).
                
                [Jump to the message](${channelURL}?messageId=${message.id})
                `,
            color: Colors.yellow,
            occurred: message.updatedAt?.toISOString() ?? new Date().toISOString(),
            fields: contentFields.concat({
                name: "Additional Info",
                value: stripIndents`
                        **Message ID:** ${inlineCode(message.id)}
                        **Channel ID:** ${inlineCode(message.channelId)}
                    `,
            }),
        });
    },
    name: "messageUpdated",
} satisfies GEvent<"messageUpdated">;

async function getDisplayedContent(ctx: YokiClient, oldMessage: Message | null, newMessage: Message) {
    // The message is too big to display the content
    if ((oldMessage?.content.length ?? 0) > 1000 || newMessage.content.length > 1000) {
        const uploadToBucket = await uploadS3(
            ctx,
            `logs/message-update-${newMessage.serverId}-${newMessage.id}.txt`,
            `
            Old: ${oldMessage?.content ?? "None"}
            ------------------------------------
            New: ${newMessage.content}
            `
        );

        return [
            {
                name: "Message Log",
                value: `This log is too big to display in Guilded. You can find the full log [here](${uploadToBucket.Location})`,
            },
        ];
    }

    // The message is small enough to display the content
    return [
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
            value: newMessage.content ? quoteMarkdown(newMessage.content, 1012) : `This message does not contain text content.`,
        },
    ];
}
