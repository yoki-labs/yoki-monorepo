import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Mod from "./Mod.command";
import Mute from "./Mute.command";

const Role: Command = {
    name: "role",
    description: "Manages moderation roles.",
    usage: "<threshold> <..args>",
    examples: ["threshold mute 5"],
    aliases: ["levels", "level", "modaction", "sv"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("mod", Mod).set("mute", Mute),
    execute: () => void 0,
};

export default Role;
