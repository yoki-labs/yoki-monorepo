import type { Command } from "./Command.spec";

export default {
    name: "ping",
    execute: (message, args, ctx, _packet) => {
        return ctx.rest.router.createChannelMessage(message.channelId, { content: "PONG!", replyMessageIds: [message.id] });
    },
} as Command;
