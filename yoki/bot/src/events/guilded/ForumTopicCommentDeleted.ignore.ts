import type { Context, Server } from "../../typings";
import BaseCommentDeleted from "./BaseCommentDeleted.ignore";
import type { ForumCommentPayload } from "./ForumTopicCommentCreated.ignore";

export default {
     execute: (packet: { d: { serverId: string; forumTopicComment: ForumCommentPayload } }, ctx: Context, _: Server) =>
    BaseCommentDeleted(packet.d.serverId, packet.d.forumTopicComment.forumTopicId, packet.d.forumTopicComment, "forums", ctx),
};