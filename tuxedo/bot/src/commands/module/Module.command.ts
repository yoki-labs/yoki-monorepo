import { Collection } from "@discordjs/collection";

import { Category, Command } from "../commands";
import Disable from "./Disable.command";
import Enable from "./Enable.command";
import List from "./List.command";
import { RoleType } from "@prisma/client";

const subCommands = new Collection<string, Command>().set("enable", Enable).set("disable", Disable).set("list", List);

const Module: Command = {
    name: "module",
    category: Category.Settings,
    aliases: ["modules"],
    description: "Enable or disable a module for this server.",
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default Module;
