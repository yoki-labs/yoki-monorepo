import Embed from "@guildedjs/embeds";
import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import { Colors } from "../color";
import { codeblock, inlineCodeblock } from "../formatters";
import type { Context } from "../typings";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    const serverFromDb = await ctx.serverUtil.getServer(message.serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    await ctx.contentFilterUtil.scanMessage(message, serverFromDb);
    const modLogChannel = await ctx.serverUtil.getLogChannel(message.serverId!, LogChannelType.CHAT_MESSAGE_UPDATE);
    if (!modLogChannel) return void 0;
    const modLogWebhook = await ctx.serverUtil.getWebhook(message.serverId!, modLogChannel.channelId);
    const oldMessage = await ctx.messageUtil.getMessage(message.channelId, message.id);
    if (oldMessage) await ctx.messageUtil.logMessage(message);
    const oldMember = await ctx.serverUtil.getMember(message.serverId!, message.createdBy);

    try {
        await modLogWebhook.send("", [
            new Embed()
                .setTitle("Updated Message!")
                .setColor(Colors.YELLOW)
                .setDescription(
                    stripIndents`
					**ID:** ${inlineCodeblock(message.id)}
					**Author:** ${inlineCodeblock(oldMember.user.name)} (${inlineCodeblock(message.createdBy ?? message.createdByBotId ?? message.createdByWebhookId)})
					**Old Message:** 
					${codeblock(oldMessage ? (oldMessage.content.length > 900 ? `${oldMessage.content.slice(0, 900)}...` : oldMessage.content) : "Could not find old version of this message.")} 
					**New Message:** 
					${codeblock(message.content.length > 900 ? `${message.content.slice(0, 900)}...` : message.content)} 
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
