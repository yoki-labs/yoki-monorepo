import { bold } from "@yokilabs/bot";

import type { Command } from "./commands";

const Ping: Command = {
    name: "ping",
    description: "Check Yoki's latency.",
    // usage: "",
    aliases: ["p"],
    execute: (message, _args, ctx) =>
        ctx.messageUtil.send(message.channelId, { content: "PONG!", replyMessageIds: [message.id] }).then((pingMessage) =>
            ctx.messages.update(pingMessage.channelId, pingMessage.id, {
                content: `PONG! Took me ${bold((new Date(pingMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) / 1000)} seconds.`,
            })
        ),
};

export default Ping;
