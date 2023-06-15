import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import SetCooldown from "./Cooldown.command";
import SetCurrency from "./Currency.command";

const Income: Command = {
    name: "income",
    description: "Allows you to manage income commands.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("cooldown", SetCooldown).set("currency", SetCurrency),
    execute: () => void 0,
};

export default Income;
