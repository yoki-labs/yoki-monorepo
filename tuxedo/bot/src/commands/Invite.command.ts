import type { Command } from "./Command";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_INVITE",
            user_id: message.createdById,
            event_properties: { serverId: message.serverId },
        });
        return ctx.messageUtil.replyWithInfo(message, `Invite the bot`, `[**Click here**]() to invite Tuxedo to your server.`, undefined, {
            isPrivate: true,
        });
    },
};

export default Invite;
