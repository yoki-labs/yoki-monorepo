import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import type { EmbedField } from "guilded.js";

import { FilteredContent } from "../../modules/content-filter";
import { GEvent, LogChannelType } from "../../typings";
import { quoteChangedContent } from "../../utils/messages";
import { moderateContent } from "../../utils/moderation";

export default {
    execute: async ([forumTopic, _oldForumTopic, ctx]) => {
        const { serverId } = forumTopic;

        // Ignore own forum topic updates
        if (forumTopic.createdBy === ctx.user!.id) return;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // get the old message from the database if we logged it before
        const oldContent = await ctx.dbUtil.getForumTopic(forumTopic.channelId, forumTopic.id);
        // if we did log it in the past, update it with the new content (logMessage uses upsert)
        if (oldContent) {
            void ctx.amp.logEvent({ event_type: "FORUM_TOPIC_UPDATE_DB", user_id: forumTopic.createdBy, event_properties: { serverId } });
            await ctx.dbUtil.storeForumTopic(forumTopic);
        }

        // Scanning
        const deletion = () => ctx.rest.delete(`/channels/${forumTopic.channelId}/topics/${forumTopic.id}`);
        const member = await ctx.members.fetch(serverId, forumTopic.createdBy).catch(() => null);

        await moderateContent(
            ctx,
            server,
            forumTopic.channelId,
            "FORUM_TOPIC",
            FilteredContent.ChannelContent,
            forumTopic.createdBy,
            member?.roleIds ?? [],
            `${forumTopic.title}\n${forumTopic.content ?? ""}`,
            forumTopic.mentions,
            deletion
        );

        // check if there's a log channel channel for message deletions
        const editedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_edits);
        if (!editedTopicLogChannel) return;

        const channel = await ctx.channels.fetch(forumTopic.channelId).catch();

        const channelURL = `https://guilded.gg/teams/${serverId}/channels/${forumTopic.channelId}/forums`;

        const contentChanged = oldContent?.content !== forumTopic.content;

        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog({
            where: editedTopicLogChannel.channelId,
            author: {
                icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                name: `Forum topic edited \u2022 ${member?.displayName ?? "Unknown user"}`,
            },
            // title: "Forum Topic Edited",
            serverId: server.serverId,
            description: `The forum topic ${inlineQuote(forumTopic.title)} by <@${forumTopic.createdBy}> (${inlineCode(forumTopic.createdBy)}) has been edited in [#${
                channel.name
            }](${channelURL}).`,
            color: Colors.yellow,
            additionalInfo: stripIndents`
                **When:** ${server.formatTimezone(forumTopic.updatedAt!)}
                **Topic ID:** ${inlineCode(forumTopic.id)}
                **Channel ID:** ${inlineCode(forumTopic.channelId)}
            `,
            // occurred: new Date().toISOString(),
            fields: [
                oldContent?.title !== forumTopic.title && {
                    name: "Title changes",
                    value: `${oldContent?.title ? inlineQuote(oldContent?.title) : "Unknown title"} -> ${inlineQuote(forumTopic.title)}`,
                },
                contentChanged && {
                    name: "Old content",
                    value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", oldContent?.content),
                },
                contentChanged && {
                    name: "New content",
                    value: await quoteChangedContent(ctx, serverId, forumTopic.id, "forums", forumTopic.content),
                },
            ].filter(Boolean) as EmbedField[],
        });
    },
    name: "forumTopicUpdated",
} satisfies GEvent<"forumTopicUpdated">;
