import { stripIndents } from "common-tags";

import { Category, Command } from "./commands";

const Dashboard: Command = {
    name: "dashboard",
    description: "Sends a link to the dashboard of the server.",
    // usage: "",
    aliases: ["db"],
    category: Category.Info,
    execute: async (message, _args, ctx, { prefix, server }) => {
        if (!server.flags.includes("EARLY_ACCESS"))
            return ctx.messageUtil.replyWithUnpermitted(message, "Unfortunately, this command is only available to servers with early access.");

        return ctx.messageUtil.replyWithInfo(
            message,
            `:link: Open dashboard`,
            stripIndents`
                The dashboard for this server is available [here](https://yoki.gg/dashboard/${message.serverId}/overview).

                **NOTE:** Dashboard is only available for people with ADMIN role at this time. If you want to grant ADMIN to a role, you can use \`role\` command like so:
                \`\`\`md
                ${prefix}role staff @RoleHere admin
                \`\`\`
            `,
            { url: `https://yoki.gg/dashboard/${message.serverId}/overview` },
            { isPrivate: true }
        );
    },
};

export default Dashboard;
