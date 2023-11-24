import { channelTypeToDisplay, channelTypeToRedIcon, inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import { type GEvent, LogChannelType } from "../../typings";

export default {
    execute: async ([channel, ctx]) => {
        const server = await ctx.dbUtil.getServer(channel.serverId);
        const { serverId } = channel;

        // No server, ignore it
        if (!server) return;
        else if (server.modmailEnabled) await ctx.supportUtil.closeThreadIfExists(server, channel.id);

        // Delete logs that have the deleted channel; there is no way for them to log anymore
        await ctx.prisma.logChannel.deleteMany({
            where: {
                serverId: channel.serverId,
                channelId: channel.id,
            },
        });

        // Ignore threads going forward
        if ((channel.raw as { id: string; parentId: string }).parentId) return;

        // check if there's a log channel channel for message deletions
        const channelDeletedLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.channel_deletions);
        if (!channelDeletedLogChannel) return;

        // send the log channel message with the content/data of the deleted message
        return ctx.messageUtil.sendLog({
            where: channelDeletedLogChannel.channelId,
            author: {
                name: `Channel deleted \u2022 ${channel.name}`,
                icon_url: channelTypeToRedIcon[channel.type],
            },
            serverId,
            description: `A channel ${inlineQuote(channel.name)} by <@${channel.createdBy}> (${inlineCode(channel.createdBy)}) was deleted from the server.`,
            additionalInfo: stripIndents`
                **Channel type:** ${channelTypeToDisplay[channel.type]}
                **Channel ID:** ${inlineCode(channel.id)}
            `,
            color: Colors.red,
        });
    },
    name: "channelDeleted",
} satisfies GEvent<"channelDeleted">;
