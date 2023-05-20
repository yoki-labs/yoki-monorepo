import { LogChannelType, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Types: Command = {
    name: "logs-types",
    description: "List all possible Log Channel types.",
    // usage: "",
    subCommand: true,
    category: Category.Logs,
    subName: "types",
    requiredRole: RoleType.ADMIN,
    execute: (message, _args, ctx) => {
        const finalString = Object.values(LogChannelType)
            .map((x) => `- \`${x}\``)
            .join("\n");

        return ctx.messageUtil.replyWithInfo(message, `Log Channel Types`, finalString);
    },
};

export default Types;
