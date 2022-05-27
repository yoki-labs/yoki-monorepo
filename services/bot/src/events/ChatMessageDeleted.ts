import type { WSChatMessageDeletedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType, Prisma } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { codeblock, inlineCodeblock } from "../formatters";
import type { Context } from "../typings";

export default async (packet: WSChatMessageDeletedPayload, ctx: Context) => {
    const { message } = packet.d;

    // check if there's a log channel channel for message deletions
    const deletedMessageLogChannel = await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType.CHAT_MESSAGE_DELETE } });
    if (!deletedMessageLogChannel) return void 0;

    // get the database entry for the deleted message
    const deletedMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);

    // mark this message as deleted if it's in the database, that way our runner can clear this message from the database after two weeks
    if (deletedMessage) await ctx.prisma.message.updateMany({ where: { messageId: deletedMessage.messageId }, data: { deletedAt: packet.d.message.deletedAt } });
    // if there is a database entry for the message, get the member from the server so we can get their name and roles etc.
    const oldMember = deletedMessage ? await ctx.serverUtil.getMember(deletedMessage.serverId!, deletedMessage.authorId).catch(() => null) : null;

    try {
        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog(
            deletedMessageLogChannel.channelId,
            "Message Deleted",
            stripIndents`
                **ID:** ${inlineCodeblock(message.id)}
                ${deletedMessage ? `**Author:** ${oldMember ? `<@${oldMember.user.id}>` : "Unknown author"}` : ``}
            `,
            Colors.red,
            message.deletedAt,
            [
                {
                    name: "Content",
                    value: deletedMessage?.content
                        ? codeblock(deletedMessage.content.length > 1012 ? `${deletedMessage.content.slice(0, 1012)}...` : deletedMessage.content)
                        : (deletedMessage?.embeds as Prisma.JsonArray)?.length
                        ? `_This message contains embeds._`
                        : `Could not find message content. This message may be older than 14 days.`,
                },
            ]
        );
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
						Reference ID: **${referenceId}**
						Server: **${deletedMessage?.serverId ?? "not cached"}**
						Channel: **${message.channelId}**
						User: **${deletedMessage?.authorId ?? "not cached"}**
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
