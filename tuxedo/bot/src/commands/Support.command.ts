import type { Command } from "./commands";

const Support: Command = {
    name: "support",
    description: "Get a link for our support server.",
    // usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_SUPPORT",
            user_id: message.createdById,
            event_properties: { serverId: message.serverId },
        });
        return ctx.messageUtil.replyWithInfo(
            message,
            `:link: Join support server`,
            `If you are having issues, bugs, have any suggestions or want to send feedback, be sure to [join the Tuxo support server](https://yoki.gg/support).`,
            { url: `https://yoki.gg/support` },
            {
                isPrivate: true,
            }
        );
    },
};

export default Support;
