import { bold } from "@yokilabs/util";

import type { Command } from "./commands";

const Ping: Command = {
    name: "ping",
    description: "Check Tuxedo's latency.",
    usage: "",
    aliases: ["p"],
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, { content: "PONG!", replyMessageIds: [message.id] }).then((pingMessage) =>
            ctx.messages.update(pingMessage.channelId, pingMessage.id, {
                content: `PONG! Took me ${bold((new Date(pingMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) / 1000)} seconds.`,
            })
        );
    },
};

export default Ping;
