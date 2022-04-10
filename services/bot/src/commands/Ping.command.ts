import type { Command } from "./Command";

const Ping: Command = {
    name: "ping",
    description: "Send a ping message",
    usage: "",
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, { content: "PONG!", replyMessageIds: [message.id] });
    },
};

export default Ping;
