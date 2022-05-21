import { Embed } from "@guildedjs/embeds";
import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { codeblock, inlineCodeblock } from "../formatters";
import type { Context, Server } from "../typings";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context, server: Server) => {
    const { message } = packet.d;
    // if this message isn't updated in a server, or if the author is a bot, ignore
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    // scan the updated message content
    await ctx.contentFilterUtil.scanMessage(message, server);
    // get the log channel for message updates
    const updatedMessageLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.CHAT_MESSAGE_UPDATE);
    // if there is no log channel for message updates, then ignore
    if (!updatedMessageLogChannel) return void 0;
    // get the old message from the database if we logged it before
    const oldMessage = await ctx.dbUtil.getMessage(message.channelId, message.id);
    // if we did log it in the past, update it with the new content (logMessage uses upsert)
    if (oldMessage) await ctx.dbUtil.storeMessage(message);
    // get the member associated with the message
    const oldMember = await ctx.serverUtil.getMember(message.serverId!, message.createdBy).catch(() => null);

    try {
        // send embed in log channel
        await ctx.messageUtil.send(
            updatedMessageLogChannel.channelId,
            new Embed()
                .setTitle("Updated Message!")
                .setColor(Colors.yellow)
                .setDescription(
                    stripIndents`
					**ID:** ${inlineCodeblock(message.id)}
					**Author:** ${inlineCodeblock(oldMember?.user.name ?? "unknown name")} (${inlineCodeblock(message.createdBy ?? message.createdByBotId ?? message.createdByWebhookId)})
					**Old Message:**
					${
                        // this slices the old message content (if it exists, otherwise default) to 900 if it's longer, for Guilded API limits
                        codeblock(
                            oldMessage?.content
                                ? oldMessage.content.length > 900
                                    ? `${oldMessage.content.slice(0, 900)}...`
                                    : oldMessage.content
                                : "Could not find old version of this message."
                        )
                    }
					**New Message:**
					${
                        // this slices the message content to 900 if it's longer, for Guilded API limits
                        codeblock(message.content.length > 900 ? `${message.content.slice(0, 900)}...` : message.content)
                    }
				`
                )
                .setTimestamp()
        );
    } catch (e) {
        ctx.prisma.logChannel.deleteMany({ where: { channelId: updatedMessageLogChannel.channelId } }).catch(() => null);
        const referenceId = nanoid();
        if (e instanceof Error) {
            console.error(e);
            void ctx.errorHandler.send("Error in logging message update!", [
                new WebhookEmbed()
                    .setDescription(
                        stripIndents`
						Reference ID: **${referenceId}**
						Server: **${message.serverId}**
						Channel: **${message.channelId}**
						User: **${message.createdBy}**
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
