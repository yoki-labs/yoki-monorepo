import { RoleType } from "../../typings";
import { Category, Command } from "../commands";
import { displayHistory } from "./util";

const All: Command = {
    name: "history-all",
    subName: "all",
    description: "Gets the list of all moderation cases in this server.",
    // usage: "[page]",
    examples: ["", "2"],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;

        await displayHistory(message, ctx, { where: { serverId: message.serverId! } }, page, "Server History", true);
    },
};

export default All;
