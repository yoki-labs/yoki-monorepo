import Collection from "@discordjs/collection";

import type { Command } from "../Command";
import Add from "./Add.command";
import Delete from "./Delete.command";
import List from "./List.command";

const Filter: Command = {
    name: "filter",
    description: "Parent command for filter related commands",
    usage: "<add | list | delete> <..args>",
    examples: ["add test-word warn", "add another-test-word ban"],
    aliases: ["words"],
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("add", Add).set("delete", Delete).set("list", List),
    execute: () => void 0,
};

export default Filter;
