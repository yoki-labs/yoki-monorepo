import type { ForumTopicPayload } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import { Context, Server, LogChannelType } from "../typings";

export default async (packet: { d: { serverId: string; forumTopic: ForumTopicPayload } }, ctx: Context, server: Server) => {
    const { forumTopic, serverId } = packet.d;

    const member = await ctx.serverUtil.getMember(serverId, forumTopic.createdBy).catch(() => null);
    if (member?.user.type === "bot") return;

    // get the old message from the database if we logged it before
    const oldContent = await ctx.dbUtil.getForumTopic(forumTopic.channelId, forumTopic.id);
    // if we did log it in the past, update it with the new content (logMessage uses upsert)
    if (oldContent) {
        void ctx.amp.logEvent({ event_type: "TOPIC_UPDATE_DB", user_id: forumTopic.createdBy, event_properties: { serverId } });
        await ctx.dbUtil.storeForumTopic(forumTopic);
    }

    // check if there's a log channel channel if it needs to be even logged
    const editedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_edits);
    if (editedTopicLogChannel) {
        void ctx.amp.logEvent({ event_type: "FORUM_TOPIC_UPDATE_DB", user_id: forumTopic.createdBy, event_properties: { serverId } });
        await ctx.dbUtil.storeForumTopic(forumTopic);
    }

    // Scanning
    const deletion = () => ctx.rest.delete(`/channels/${forumTopic.channelId}/topics/${forumTopic.id}`);

    const enabledPresets = server.filterEnabled ? await ctx.dbUtil.getEnabledPresets(server.serverId) : undefined;

    if (server.filterEnabled) {
        // Scan the forum topic for any harmful content (filter list, presets)
        await ctx.contentFilterUtil.scanContent({
            userId: forumTopic.createdByWebhookId || forumTopic.createdBy,
            text: forumTopic.content!,
            filteredContent: FilteredContent.ChannelContent,
            channelId: forumTopic.channelId,
            server,
            presets: enabledPresets,
            // Filter
            resultingAction: deletion,
        });

        // Spam prevention
        await ctx.spamFilterUtil.checkForSpam(server, forumTopic.createdBy, forumTopic.channelId, deletion);
    }

    if (server.filterInvites || server.filterEnabled)
        // Invites or bad URLs
        await ctx.linkFilterUtil.checkLinks({
            server,
            userId: forumTopic.createdBy,
            channelId: forumTopic.channelId,
            content: forumTopic.content!,
            filteredContent: FilteredContent.ChannelContent,
            presets: enabledPresets,
            resultingAction: deletion,
        });

    return void 0;
};
