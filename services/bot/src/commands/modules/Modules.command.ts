import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import Disable from "./Disable.command";
import Enable from "./Enable.command";
import List from "./List.command";

const subCommands = new Collection<string, Command>().set("enable", Enable).set("disable", Disable).set("list", List);

const Modules: Command = {
    name: "modules",
    category: Category.Settings,
    aliases: ["module"],
    description: "Enable or disable a module for this server.",
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default Modules;
