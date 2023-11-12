import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { GEvent, LogChannelType } from "../../typings";

export default {
    execute: async ([forumTopic, ctx]) => {
        const { serverId } = forumTopic;

        // Ignore own forum topic locks
        if (forumTopic.createdBy === ctx.user!.id) return;

        // check if there's a log channel channel for message deletions
        const lockedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_locks);
        if (!lockedTopicLogChannel) return;

        const member = await ctx.members.fetch(serverId, forumTopic.createdBy).catch(() => null);
        if (member?.user?.type === UserType.Bot) return;

        const channel = await ctx.channels.fetch(forumTopic.channelId).catch();

        const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

        // send the log channel message with the content/data of the deleted message
        return ctx.messageUtil.sendLog({
            where: lockedTopicLogChannel.channelId,
            author: {
                icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                name: `Forum topic locked \u2022 ${member?.displayName ?? "Unknown user"}`,
            },
            // title: `Forum Topic Locked`,
            serverId,
            description: `A forum topic ${inlineQuote(forumTopic.title)} by <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) was locked in [#${
                channel.name
            }](${channelURL}).`,
            additionalInfo: stripIndents`
                **Topic ID:** ${inlineCode(forumTopic.id)}
                **Channel ID:** ${inlineCode(forumTopic.channelId)}
            `,
            color: Colors.red,
            // occurred: new Date().toISOString(),
        });
    },
    name: "forumTopicLocked",
} satisfies GEvent<"forumTopicLocked">;
