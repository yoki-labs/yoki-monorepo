import { MentionsPayload,UserType} from "guilded.js";

import { FilteredContent } from "../../modules/content-filter";
import type { Context, Server } from "../../typings";
import { moderateContent } from "../../utils/moderation";

export interface CommentPayload {
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string | undefined;
    createdBy: string;
    channelId: string;
    mentions: MentionsPayload;
};

export default  async (serverId: string, parentId: number, comment: CommentPayload, contentType: "topics" | "docs" | "events", ctx: Context, server: Server) => {
    const member = await ctx.members.fetch(serverId, comment.createdBy).catch(() => null);
    if (member?.user?.type === UserType.Bot) return;

    // // check if there's a log channel channel if it needs to be even logged
    // const editedTopicLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.topic_edits);
    // if (editedTopicLogChannel) {
    //     void ctx.amp.logEvent({ event_type: "FORUM_COMMENT_UPDATE_DB", user_id: forumTopicComment.createdBy, event_properties: { serverId } });
    //     await ctx.dbUtil.storeForumComment(forumTopicComment);
    // }

    // Scanning
    const deletion = () => ctx.rest.delete(`/channels/${comment.channelId}/${contentType}/${parentId}/comments/${comment.id}`);

    await moderateContent(
        ctx,
        server,
        comment.channelId,
        "COMMENT",
        FilteredContent.ChannelContent,
        comment.createdBy,
        comment.content,
        comment.mentions,
        deletion
    );

    return void 0;
};
