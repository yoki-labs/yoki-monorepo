import Collection from "@discordjs/collection";

import { Category } from "../../Category";
import type { Command } from "../../Command";
import Add from "./Add.command";
import Remove from "./Remove.command";

const Url: Command = {
    name: "link-url",
    subName: "url",
    description: "Manages domain blacklists.",
    examples: ["add example.com warn", "add discord.com ban"],
    parentCommand: true,
    subCommand: true,
    category: Category.Filter,
    subCommands: new Collection<string, Command>().set("add", Add).set("remove", Remove),
    execute: () => void 0,
};

export default Url;
