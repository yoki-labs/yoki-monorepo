import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";

const Dashboard: Command = {
    name: "dashboard",
    description: "Sends a link to the dashboard of the server.",
    // usage: "",
    aliases: ["db"],
    category: Category.Info,
    requiredRole: RoleType.MINIMOD,
    execute: (message, _args, ctx, { server }) => {
        if (!server.flags.includes("EARLY_ACCESS"))
            return ctx.messageUtil.replyWithUnpermitted(message, "Unfortunately, this command is only available to servers with early access.");

        return ctx.messageUtil.replyWithInfo(
            message,
            `:link: Open dashboard`,
            `The dashboard for this server is available [here](https://yoki.gg/dashboard/${message.serverId}/overview).`,
            { url: `https://yoki.gg/dashboard/${message.serverId}/overview` },
            { isPrivate: true }
        );
    },
};

export default Dashboard;
