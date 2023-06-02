import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Staff from "./Staff.command";

const Role: Command = {
    name: "role",
    description: "Manages economy and giveaway management roles.",
    examples: ["staff", "staff 12345678 admin"],
    aliases: ["roles", "r"],
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("staff", Staff),
    execute: () => void 0,
};

export default Role;
