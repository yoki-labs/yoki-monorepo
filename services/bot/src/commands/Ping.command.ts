import { bold } from "../formatters";
import type { Command } from "./Command";

const Ping: Command = {
    name: "ping",
    description: "Send a ping message",
    usage: "",
    aliases: ["p"],
    execute: (message, _args, ctx, commandCtx) => {
        return ctx.messageUtil.send(message.channelId, { content: commandCtx.language.getTerm("ping"), replyMessageIds: [message.id] }).then((pingMessage) => {
            const msecDelta = new Date(pingMessage.createdAt).getTime() - new Date(message.createdAt).getTime();

            return ctx.rest.router.updateChannelMessage(pingMessage.channelId, pingMessage.id, {
                content: commandCtx.language.getTerm("pingTimed", bold(msecDelta / 1000)),
            });
        });
    },
};

export default Ping;
