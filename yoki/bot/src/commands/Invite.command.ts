import type { Command } from "./commands";

const Invite: Command = {
    name: "invite",
    description: "Get a link for inviting the bot.",
    // usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_INVITE",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        return ctx.messageUtil.replyWithInfo(
            message,
            `:link: Invite Yoki`,
            `Yoki is available for all servers to invite. [Click here](https://www.guilded.gg/b/7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd) to invite Yoki to your server.`,
            { url: `https://www.guilded.gg/b/7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd` },
            {
                isPrivate: true,
            }
        );
    },
};

export default Invite;
