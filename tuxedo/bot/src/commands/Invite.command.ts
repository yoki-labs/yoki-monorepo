import type { Command } from "./commands";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    // usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_INVITE",
            user_id: message.createdById,
            event_properties: { serverId: message.serverId },
        });
        return ctx.messageUtil.replyWithInfo(
            message,
            `Invite the bot`,
            `[**Click here**](https://guilded.gg/b/deabc4d2-ad06-44dd-a053-da4970229b28) to invite Tuxo to your server.`,
            undefined,
            {
                isPrivate: true,
            }
        );
    },
};

export default Invite;
