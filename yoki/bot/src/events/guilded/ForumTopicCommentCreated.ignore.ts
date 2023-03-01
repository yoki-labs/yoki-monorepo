// import type { GEvent } from "../../typings";
// import type { Context, Server } from "../typings";
// import BaseCommentEvent, { CommentPayload } from "./BaseCommentEvent";

import type { CommentPayload } from "./BaseCommentEvent.ignore";

export interface ForumCommentPayload extends CommentPayload {
    forumTopicId: number;
};

// export default {
//      execute: async (packet: { d: { serverId: string; forumTopicComment: ForumCommentPayload } }, ctx: Context, server: Server) =>
//     BaseCommentEvent(packet.d.serverId, packet.d.forumTopicComment.forumTopicId, packet.d.forumTopicComment, "topics", ctx, server);
// } satisfies GEvent<>;