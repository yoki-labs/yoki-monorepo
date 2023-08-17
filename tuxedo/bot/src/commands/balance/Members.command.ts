import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Purge from "./Purge.command";
import SetBalance from "./SetBalance.command";
import SetInventory from "./SetInventory.command";

const Members: Command = {
    name: "members",
    description: "Allows you to manage members' balances and inventories.",
    examples: [],
    parentCommand: true,
    category: Category.Balance,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>()
        .set("setbalance", SetBalance)
        .set("setinventory", SetInventory)
        .set("purgebalances", Purge),
    execute: () => void 0,
};

export default Members;
