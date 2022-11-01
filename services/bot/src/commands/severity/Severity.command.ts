import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Threshold from "./Threshold.command";

const Severity: Command = {
    name: "severity",
    description: "Manages action severity/auto-mod actions.",
    usage: "<threshold> <..args>",
    examples: ["threshold mute 5"],
    aliases: ["levels", "level", "modaction", "sv"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("threshold", Threshold),
    execute: () => void 0,
};

export default Severity;
