import type { Command } from "./Command";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    usage: "",
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.send(message.channelId, {
            content: "Here is the link for inviting the bot: https://yoki-labs.xyz/yoki/invite",
            replyMessageIds: [message.id],
            isPrivate: true,
        });
    },
};

export default Invite;
