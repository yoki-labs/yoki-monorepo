import { bold } from "@yokilabs/util";

import type { Command } from "./Command";

const Ping: Command = {
    name: "ping",
    description: "Check Tuxedo's latency.",
    usage: "",
    aliases: ["p"],
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, { content: "PONG!", replyMessageIds: [message.id] }).then((pingMessage) =>
            ctx.rest.router.updateChannelMessage(pingMessage.channelId, pingMessage.id, {
                content: `PONG! Took me ${bold((new Date(pingMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) / 1000)} seconds.`,
            })
        );
    },
};

export default Ping;
