import type { Context, Server } from "../../typings";
import BaseCommentEvent, { CommentPayload } from "./BaseCommentEvent";

export interface CalendarCommentPayload extends CommentPayload {
    calendarEventId: number;
};

export default async (packet: { d: { serverId: string; calendarEventComment: CalendarCommentPayload } }, ctx: Context, server: Server) =>
    BaseCommentEvent(packet.d.serverId, packet.d.calendarEventComment.calendarEventId, packet.d.calendarEventComment, "topics", ctx, server);
