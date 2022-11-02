import type { Command } from "./Command";

const Support: Command = {
    name: "support",
    description: "Get a link for our support server.",
    usage: "",
    execute: (message, _args, ctx) => {
        void ctx.amp.logEvent({
            event_type: "BOT_SUPPORT",
            user_id: message.createdBy,
            event_properties: { serverId: message.serverId },
        });
        return ctx.messageUtil.replyWithInfo(message, `Support server`, `[**Click here**](https://yoki.gg/support) to join our support server.`, undefined, {
            isPrivate: true,
        });
    },
};

export default Support;
