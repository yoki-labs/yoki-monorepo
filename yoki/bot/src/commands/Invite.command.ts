import type { Command } from "./Command";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_INVITE",
            user_id: message.createdBy,
            event_properties: { serverId: message.serverId },
        });
        return ctx.messageUtil.replyWithInfo(
            message,
            `Invite the bot`,
            `[**Click here**](https://www.guilded.gg/b/7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd) to invite Yoki to your server.`,
            undefined,
            {
                isPrivate: true,
            }
        );
    },
};

export default Invite;
