import Collection from "@discordjs/collection";

import type { Command } from "../Command";
import Add from "./Add.command";
import Disable from "./Disable.command";
import Enable from "./Enable.command";
import List from "./List.command";
import Remove from "./Remove.command";

const Filter: Command = {
    name: "filter",
    description: "Parent command for filter related commands",
    usage: "<add | list | delete> <..args>",
    examples: ["add test-word warn", "add another-test-word ban"],
    aliases: ["words"],
    parentCommand: true,
    subCommands: new Collection<string, Command>()
        .set("add", Add)
        .set("remove", Remove)
        .set("list", List)
        .set("enable", Enable)
        .set("disable", Disable),
    execute: () => void 0,
};

export default Filter;
