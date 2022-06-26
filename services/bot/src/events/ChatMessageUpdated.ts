import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { inlineCode, quoteMarkdown } from "../formatters";
import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context, server: Server) => {
    const { message } = packet.d;
    // if this message isn't updated in a server, or if the author is a bot, ignore
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

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
    const updatedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.CHAT_MESSAGE_UPDATE);
    // if there is no log channel for message updates, then ignore
    if (!updatedMessageLogChannel) return void 0;
    // get the old message from the database if we logged it before
    const oldMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);
    // if we did log it in the past, update it with the new content (logMessage uses upsert)
    if (oldMessage) await ctx.dbUtil.storeMessage(message);

    try {
        // send embed in log channel
        await ctx.messageUtil.sendLog(
            updatedMessageLogChannel.channelId,
            `Message edited`,
            stripIndents`
                **ID:** ${inlineCode(message.id)}
                **Author:** ${message.createdByWebhookId ? `Webhook` : `<@${message.createdBy}>`}
            `,
            Colors.yellow,
            message.updatedAt!,
            [
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
            ]
        );
    } catch (e) {
        ctx.prisma.logChannel
            .deleteMany({ where: { channelId: updatedMessageLogChannel.channelId } })
            .then(() => ctx.errorHandler.send(`DELETED LOG CHANNEL ${updatedMessageLogChannel.channelId}`))
            .catch(() => null);
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
