import type { Context, Server } from "../../typings";
import BaseCommentEvent, { CommentPayload } from "./BaseCommentEvent.ignore";

export interface ForumCommentPayload extends CommentPayload {
    forumTopicId: number;
};

export default async (packet: { d: { serverId: string; forumTopicComment: ForumCommentPayload } }, ctx: Context, server: Server) =>
    BaseCommentEvent(packet.d.serverId, packet.d.forumTopicComment.forumTopicId, packet.d.forumTopicComment, "topics", ctx, server);