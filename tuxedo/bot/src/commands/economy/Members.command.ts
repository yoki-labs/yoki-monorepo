import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Purge from "./Purge.command";
import Set from "./Set.command";

const Members: Command = {
    name: "members",
    description: "Allows you to manage members' balances and inventories.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("set-balance", Set).set("purge-balances", Purge),
    execute: () => void 0,
};

export default Members;
