import type { Context, Server } from "../../typings";
import BaseCommentDeleted from "./BaseCommentDeleted.ignore";
import type { CalendarCommentPayload } from "./CalendarEventCommentEvent.ignore";

export default (packet: { d: { serverId: string; calendarEventComment: CalendarCommentPayload } }, ctx: Context, _: Server) =>
    BaseCommentDeleted(packet.d.serverId, packet.d.calendarEventComment.calendarEventId, packet.d.calendarEventComment, "calendar", ctx);
