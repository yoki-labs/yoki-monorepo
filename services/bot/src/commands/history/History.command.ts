import Collection from "@discordjs/collection";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import Clear from "./Clear.command";
import View from "./View.command";

const History: Command = {
    name: "history",
    description: "Manages user's history.",
    examples: ["view R40Mp0Wd", "view R40Mp0Wd 2"],
    aliases: ["modactions", "actions", "hs"],
    parentCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    subCommands: new Collection<string, Command>().set("view", View).set("clear", Clear),
    execute: () => void 0,
};

export default History;
