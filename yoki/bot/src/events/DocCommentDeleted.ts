import type { Context, Server } from "../typings";
import BaseCommentDeleted from "./BaseCommentDeleted";
import type { DocCommentPayload } from "./DocCommentEvent";

export default async (packet: { d: { serverId: string; docComment: DocCommentPayload } }, ctx: Context, _: Server) =>
    BaseCommentDeleted(packet.d.serverId, packet.d.docComment.docId, packet.d.docComment, "docs", ctx);
