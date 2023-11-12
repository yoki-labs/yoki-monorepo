import { ContentIgnoreType, LogChannelType } from "@prisma/client";
import type { GEvent } from "../../typings";
import { moderateContent } from "../../utils/moderation";
import { FilteredContent } from "../../modules/content-filter";
import { channelTypeToDisplay, channelTypeToGreenIcon, inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Colors } from "@yokilabs/utils";

export default {
    execute: async ([channel, ctx]) => {
        const { serverId } = channel;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // Only if it's a thread; parentId instead of messageId, because it can filter list threads too
        if ((channel.raw as { id: string; parentId: string }).parentId) {
            const member = await ctx.members.fetch(serverId, channel.createdBy).catch(() => null);

            return moderateContent(
                ctx,
                server,
                channel.id,
                ContentIgnoreType.THREAD,
                FilteredContent.Channel,
                channel.createdBy,
                member?.roleIds ?? [],
                // To moderate forum titles as well
                channel.name,
                undefined,
                () => ctx.channels.update(channel.id, { name: "Filtered thread name" })
            );
        }

        // check if there's a log channel channel for message deletions
        const channelCreatedLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.channel_creations);
        if (!channelCreatedLogChannel) return;

        // send the log channel message with the content/data of the deleted message
        return ctx.messageUtil.sendLog({
            where: channelCreatedLogChannel.channelId,
            author: {
                name: `Channel created \u2022 ${channel.name}`,
                icon_url: channelTypeToGreenIcon[channel.type],
            },
            serverId,
            description: `A channel ${inlineQuote(channel.name)} was created by <@${channel.createdBy}> (${inlineCode(channel.createdBy)}).`,
            additionalInfo: stripIndents`
                **Channel type:** ${channelTypeToDisplay[channel.type]}
                **Channel ID:** ${inlineCode(channel.id)}
            `,
            color: Colors.green,
        });
    },
    name: "channelCreated",
} satisfies GEvent<"channelCreated">;
