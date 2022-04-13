import type { Command } from "./Command";

const Support: Command = {
    name: "support",
    description: "Get a link for our support server.",
    usage: "",
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, {
            content: "Here is the link to our support server: https://yoki-labs.xyz/invite",
            replyMessageIds: [message.id],
            isPrivate: true,
        });
    },
};

export default Support;
