import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import SetCooldown from "./Cooldown.command";
import Create from "./Create.command";
import SetCurrency from "./Currency.command";
import Enable from "./Enable.command";
<<<<<<< HEAD
=======
import SetFailChance from "./FailChance.command";
import SetFailCut from "./FailCut.command";
>>>>>>> main
import Info from "./Info.command";
import List from "./List.command";
import SetMessage from "./Message.command";
import Remove from "./Remove.command";

const Income: Command = {
    name: "income",
    description: "Allows you to manage income commands.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>()
        .set("create", Create)
        .set("list", List)
        .set("info", Info)
        .set("cooldown", SetCooldown)
        .set("message", SetMessage)
        .set("currency", SetCurrency)
        .set("failchance", SetFailChance)
        .set("failcut", SetFailCut)
        .set("enable", Enable)
        .set("remove", Remove),
    execute: () => void 0,
};

export default Income;
