import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";

const Dashboard: Command = {
    name: "dashboard",
    description: "Get a link to the dashboard of the server.",
    // usage: "",
    aliases: ["db"],
    category: Category.Info,
    requiredRole: RoleType.MINIMOD,
    execute: (message, _args, ctx) => {
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
