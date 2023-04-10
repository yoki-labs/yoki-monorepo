import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../../commands";
import Add from "./Add.command";
import Remove from "./Remove.command";
import Whitelist from "./Whitelist.command";

const Url: Command = {
    name: "link-url",
    subName: "url",
    description: "Manages domain blacklists and whitelists.",
    examples: ["add example.com warn", "add discord.com ban"],
    parentCommand: true,
    subCommand: true,
    category: Category.Settings,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("add", Add).set("remove", Remove).set("whitelist", Whitelist),
    execute: () => void 0,
};

export default Url;
