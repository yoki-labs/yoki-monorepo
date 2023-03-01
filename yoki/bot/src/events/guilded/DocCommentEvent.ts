import type { Context, Server } from "../typings";
import BaseCommentEvent, { CommentPayload } from "./BaseCommentEvent";

export interface DocCommentPayload extends CommentPayload {
    docId: number;
};

export default async (packet: { d: { serverId: string; docComment: DocCommentPayload } }, ctx: Context, server: Server) =>
    BaseCommentEvent(packet.d.serverId, packet.d.docComment.docId, packet.d.docComment, "docs", ctx, server);
