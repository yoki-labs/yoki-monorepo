import type { WSForumTopicCreated } from "";

import { FilteredContent } from "../../modules/content-filter";
import { Context, LogChannelType, Server } from "../../typings";
import { moderateContent } from "../../utils/moderation";

export default async (packet: WSForumTopicCreated, ctx: Context, server: Server) => {
    const { forumTopic, serverId } = packet.d;

    const member = await ctx.members.fetch(serverId, forumTopic.createdBy).catch(() => null);
    if (member?.user.type === UserType.Bot) return;

    // check if there's a log channel channel if it needs to be even logged
    const editedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_edits);
    if (editedTopicLogChannel) {
        void ctx.amp.logEvent({ event_type: "FORUM_TOPIC_UPDATE_DB", user_id: forumTopic.createdBy, event_properties: { serverId } });
        await ctx.dbUtil.storeForumTopic(forumTopic);
    }

    // Scanning
    const deletion = () => ctx.rest.delete(`/channels/${forumTopic.channelId}/topics/${forumTopic.id}`);

    await moderateContent(
        ctx,
        server,
        forumTopic.channelId,
        "FORUM_TOPIC",
        FilteredContent.ChannelContent,
        forumTopic.createdBy,
        // To moderate forum titles as well
        `${forumTopic.title}\n${forumTopic.content ?? ""}`,
        forumTopic.mentions,
        deletion
    );

    return void 0;
};
