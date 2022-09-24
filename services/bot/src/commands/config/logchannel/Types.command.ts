import { LogChannelType, RoleType } from "../../../typings";
import { Category } from "../../Category";
import type { Command } from "../../Command";

const Types: Command = {
    name: "logchannel-types",
    description: "List all possible Log Channel types.",
    usage: "",
    subCommand: true,
    category: Category.Settings,
    subName: "types",
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx) => {
        let finalString = "";
        finalString = Object.values(LogChannelType)
            .map((x) => `- \`${x}\``)
            .join("\n");

        return ctx.messageUtil.replyWithInfo(message, `Log Channel Types`, finalString);
    },
};

export default Types;
