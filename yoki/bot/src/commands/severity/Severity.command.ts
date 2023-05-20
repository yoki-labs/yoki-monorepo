import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Threshold from "./Threshold.command";

const Severity: Command = {
    name: "severity",
    description: "Manages action severity/auto-mod actions.",
    // usage: "<threshold> <..args>",
    examples: ["threshold mute 5"],
    aliases: ["levels", "level", "modaction", "sv"],
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("threshold", Threshold),
    execute: () => void 0,
};

export default Severity;
