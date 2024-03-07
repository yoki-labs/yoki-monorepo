import { Collection } from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";
import All from "./All.command";
import Clear from "./Clear.command";
import View from "./View.command";

const History: Command = {
    name: "history",
    description: "Manage and view cases in this server.",
    examples: ["view R40Mp0Wd", "view R40Mp0Wd 2"],
    aliases: ["modactions", "actions", "hs"],
    parentCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    subCommands: new Collection<string, Command>().set("view", View).set("clear", Clear).set("all", All),
    execute: () => void 0,
};

export default History;
