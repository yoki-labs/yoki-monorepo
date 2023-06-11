import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Set from "./Set.command";
import Purge from "./Purge.command";

const Income: Command = {
    name: "income",
    description: "Allows you to manage people's balances.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("set", Set).set("purge", Purge),
    execute: () => void 0,
};

export default Income;
