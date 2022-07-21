import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import Challenge from "./Response.command";

const subCommands = new Collection<string, Command>().set("challenge", Challenge);

const Antiraid: Command = {
    name: "antiraid",
    category: Category.Settings,
    description: "Configure the anti-raid module for this server.",
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default Antiraid;
