import i18n from "i18n";

import { bold } from "../formatters";
import type { Command } from "./Command";

const Ping: Command = {
    name: "ping",
    description: "Send a ping message",
    usage: "",
    aliases: ["p"],
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, { content: i18n.__("ping"), replyMessageIds: [message.id] }).then((pingMessage) => {
            const msecDelta = new Date(pingMessage.createdAt).getTime() - new Date(message.createdAt).getTime();

            return ctx.rest.router.updateChannelMessage(pingMessage.channelId, pingMessage.id, {
                content: i18n.__("ping.timed", bold(msecDelta / 1000)),
            });
        });
    },
};

export default Ping;
