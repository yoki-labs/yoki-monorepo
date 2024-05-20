import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import SetCanBuy from "./CanBuy.command";
import SetCanTransfer from "./CanTransfer.command";
import Create from "./Create.command";
import Delete from "./Delete.command";
import SetGiveRole from "./GiveRole.command";
import Info from "./Info.command";
import List from "./List.command";
import SetName from "./Name.command";
import SetPrice from "./Price.command";

const Items: Command = {
    name: "items",
    aliases: ["item", "it"],
    description: "Allows you to buy items.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>()
        .set("create", Create)
        .set("list", List)
        .set("info", Info)
        .set("name", SetName)
        .set("canbuy", SetCanBuy)
        .set("cantransfer", SetCanTransfer)
        .set("price", SetPrice)
        .set("giverole", SetGiveRole)
        .set("delete", Delete),
    execute: () => void 0,
};

export default Items;
