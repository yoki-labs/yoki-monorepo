import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { GEvent, LogChannelType } from "../../typings";
import { quoteChangedContent } from "../../utils/messages";

export default {
    execute: async ([forumTopic, ctx]) => {
        const { serverId } = forumTopic;

        // Ignore own comment deletions
        if (forumTopic.createdBy === ctx.user!.id) return;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        await ctx.prisma.forumTopic.deleteMany({ where: { serverId, channelId: forumTopic.channelId, forumTopicId: forumTopic.id } });

        // check if there's a log channel channel for message deletions
        const deletedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_deletions);
        if (!deletedTopicLogChannel) return;

        const member = await ctx.members.fetch(serverId, forumTopic.createdBy).catch(() => null);
        if (member?.user?.type === UserType.Bot) return;

        const channel = await ctx.channels.fetch(forumTopic.channelId).catch();

        const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog({
            where: deletedTopicLogChannel.channelId,
            serverId,
            author: {
                icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                name: `Forum topic deleted \u2022 ${member?.displayName ?? "Unknown user"}`,
            },
            // title: "Forum Topic Removed",
            description: `The forum topic ${inlineQuote(forumTopic.title)} by <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) was deleted in [#${
                channel.name
            }](${channelURL}).`,
            additionalInfo: stripIndents`
                **When:** ${server.formatTimezone(forumTopic.deletedAt ?? new Date())}
                **Topic ID:** ${inlineCode(forumTopic.id)}
                **Channel ID:** ${inlineCode(forumTopic.channelId)}
            `,
            color: Colors.red,
            // occurred: new Date().toISOString(),
            fields: [
                {
                    name: "Content",
                    value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", forumTopic.content),
                },
            ],
        });
    },
    name: "forumTopicDeleted",
} satisfies GEvent<"forumTopicDeleted">;
