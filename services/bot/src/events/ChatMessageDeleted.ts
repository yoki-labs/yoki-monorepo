import Embed from "@guildedjs/embeds";
import type { WSChatMessageDeletedPayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { codeblock, inlineCodeblock } from "../formatters";
import type { Context } from "../typings";

export default async (packet: WSChatMessageDeletedPayload, ctx: Context) => {
    const { message } = packet.d;

    const modLogChannel = await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId, type: LogChannelType.CHAT_MESSAGE_DELETE } });
    if (!modLogChannel) return void 0;
    const modLogWebhook = await ctx.serverUtil.getWebhook(message.serverId, modLogChannel.channelId);
    if (!modLogWebhook) return void 0;
    const deletedMessage = await ctx.messageUtil.getMessage(message.channelId, message.id);
    if (deletedMessage) await ctx.prisma.message.delete({ where: { messageId: deletedMessage.messageId } });
    const oldMember = deletedMessage ? await ctx.serverUtil.getMember(deletedMessage.serverId!, deletedMessage.authorId) : null;

    try {
        await modLogWebhook.send("", [
            new Embed()
                .setTitle("Deleted Message!")
                .setColor(Colors.RED)
                .setDescription(
                    stripIndents`
					**ID:** ${inlineCodeblock(message.id)}
					**Author:** ${inlineCodeblock(oldMember?.user.name ?? "Could not find data")} (${inlineCodeblock(deletedMessage?.authorId ?? "Could not find data")})
					**Deleted Message:** 
					${codeblock(deletedMessage ? (deletedMessage.content.length > 900 ? `${deletedMessage.content.slice(0, 900)}...` : deletedMessage.content) : "Could not find message content.")} 
				`
                )
                .setTimestamp(),
        ]);
    } catch (e) {
        const referenceId = nanoid();
        if (e instanceof Error) {
            console.error(e);
            void ctx.errorHandler.send("Error in logging message update!", [
                new Embed()
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
