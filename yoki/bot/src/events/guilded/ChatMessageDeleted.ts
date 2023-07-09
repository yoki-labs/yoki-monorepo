import { LogChannelType, Prisma } from "@prisma/client";
import { codeBlock, inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import type { GEvent } from "../../typings";
import { uploadS3 } from "../../utils/s3";

export default {
    execute: async ([message, ctx]) => {
        // check if there's a log channel channel for message deletions
        const deletedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.message_deletions);
        if (!deletedMessageLogChannel) return;

        // get the database entry for the deleted message
        const deletedMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);

        // mark this message as deleted if it's in the database, that way our runner can clear this message from the database after two weeks
        if (deletedMessage) {
            void ctx.amp.logEvent({ event_type: "MESSAGE_DELETE_DB", user_id: deletedMessage.authorId, event_properties: { serverId: message.serverId! } });
            await ctx.prisma.message.updateMany({ where: { messageId: deletedMessage.messageId }, data: { deletedAt: message.deletedAt } });
        }
        // if there is a database entry for the message, get the member from the server so we can get their name and roles etc.
        const oldMember = deletedMessage ? await ctx.members.fetch(deletedMessage.serverId!, deletedMessage.authorId).catch(() => null) : null;
        if (oldMember?.user?.type === UserType.Bot) return;
        const channel = await ctx.channels.fetch(message.channelId).catch();

        const logContent = [
            {
                name: "Content",
                value: deletedMessage?.content
                    ? codeBlock(deletedMessage.content.length > 1012 ? `${deletedMessage.content.slice(0, 1012)}...` : deletedMessage.content)
                    : (deletedMessage?.embeds as Prisma.JsonArray)?.length
                    ? `_This message contains embeds._`
                    : `Could not find message content. This message may be older than 14 days.`,
            },
            {
                name: "Additional Info",
                value: stripIndents`
                        **Message ID:** ${inlineCode(message.id)}
                        **Channel ID:** ${inlineCode(message.channelId)}
                    `,
            },
        ];

        if (deletedMessage && (deletedMessage?.content.length ?? 0) > 1000) {
            const uploadToBucket = await uploadS3(
                ctx,
                `logs/message-delete-${message.serverId}-${message.id}.txt`,
                `
                Content: ${deletedMessage.content}
                ------------------------------------
                `
            );
            logContent[0].value = `This log is too big to display in Guilded. You can find the full log [here](${uploadToBucket.Location})`;
        }

        const author = deletedMessage && oldMember ? `<@${oldMember.user!.id}> (${inlineCode(oldMember.user!.id)})` : "Unknown author";
        const channelURL = `https://guilded.gg/teams/${message.serverId}/channels/${message.channelId}/chat`;
        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog({
            where: deletedMessageLogChannel.channelId,
            serverId: message.serverId!,
            title: "Message Removed",
            description: `A message from ${author} was deleted in [#${channel.name}](${channelURL}).`,
            color: Colors.red,
            occurred: message.deletedAt,
            fields: logContent,
        });
    },
    name: "messageDeleted",
} satisfies GEvent<"messageDeleted">;
