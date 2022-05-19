import type { Command } from "./Command";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    usage: "",
    execute: (message, _args, ctx) => {
        return ctx.messageUtil.replyWithContent(message, `Invite the bot`, `[**Click here**](https://yoki.gg/invite) to invite Yoki to your server.`, undefined, {
            isPrivate: true,
        });
    },
};

export default Invite;
