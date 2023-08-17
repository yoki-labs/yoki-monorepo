import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Info from "./Info.command";
import List from "./List.command";
import Buy from "./Buy.command";
import Sell from "./Sell.command";

const Shop: Command = {
    name: "shop",
    description: "Allows you to manage and configure items.",
    aliases: ["store", "sh"],
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>()
        .set("buy", Buy)
        .set("sell", Sell)
        .set("list", List)
        .set("info", Info),
    execute: () => void 0,
};

export default Shop;
