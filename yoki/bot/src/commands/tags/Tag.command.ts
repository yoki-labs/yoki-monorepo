import { Collection } from "@discordjs/collection";

import { Category, Command } from "../commands";
import List from "./List.command";
import Remove from "./Remove.command";

const Tag: Command = {
    name: "tag",
    description: "Manages custom tags/custom commands.",
    // usage: "<add | list | remove> <..args>",
    examples: ["add tag-1 this is the content for tag 1"],
    aliases: ["snippets", "customcommands", "tags"],
    category: Category.Info,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("remove", Remove).set("list", List),
    execute: () => void 0,
};

export default Tag;
