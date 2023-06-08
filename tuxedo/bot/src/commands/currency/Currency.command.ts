import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Create from "./Create.command";
import Delete from "./Delete.command";
import Info from "./Info.command";
import List from "./List.command";

const Currency: Command = {
    name: "currency",
    description: "Allows you to manage currencies and some economy aspects.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>().set("create", Create).set("list", List).set("info", Info).set("delete", Delete),
    execute: () => void 0,
};

export default Currency;
