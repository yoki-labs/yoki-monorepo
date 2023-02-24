import type { Context, Server } from "../typings";
import BaseCommentDeleted from "./BaseCommentDeleted";
import type { ForumCommentPayload } from "./ForumTopicCommentEvent";

export default async (packet: { d: { serverId: string; forumTopicComment: ForumCommentPayload } }, ctx: Context, _: Server) =>
    BaseCommentDeleted(packet.d.serverId, packet.d.forumTopicComment.forumTopicId, packet.d.forumTopicComment, "forums", ctx);
