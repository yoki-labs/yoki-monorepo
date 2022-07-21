import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Add from "./Add.command";
import List from "./List.command";
import Remove from "./Remove.command";

const Filter: Command = {
    name: "filter",
    description: "Parent command for filter related commands",
    examples: ["add test-word warn", "add another-test-word ban"],
    parentCommand: true,
    category: Category.Settings,
    subCommands: new Collection<string, Command>().set("add", Add).set("remove", Remove).set("list", List),
    execute: () => void 0,
};

export default Filter;
