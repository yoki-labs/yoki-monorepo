import { User } from "guilded.js";
import { RoleType } from "../../typings";
import { Category, Command } from "../commands";
import { displayHistory } from "./util";

const View: Command = {
    name: "history-view",
    subName: "view",
    description: "Get the list of moderation cases of a user.",
    // usage: "<target> [page number]",
    examples: ["R40Mp0Wd", "R40Mp0Wd 2"],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            display: "user",
            type: "user",
        },
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as User;
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;
        console.log("Target", target.id);

        await displayHistory(message, ctx, { where: { serverId: message.serverId!, targetId: target.id } }, page, `<@${target.id}>'s History`);
    },
};

export default View;
