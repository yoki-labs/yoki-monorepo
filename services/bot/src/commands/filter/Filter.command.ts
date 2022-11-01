import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Add from "./Add.command";
import List from "./List.command";
import FilterOnMods from "./Mods.command";
import Remove from "./Remove.command";

const Filter: Command = {
    name: "filter",
    description: "Configures content filtering.",
    examples: ["add test-word warn", "add another-test-word ban"],
    parentCommand: true,
    category: Category.Filter,
    subCommands: new Collection<string, Command>().set("onmods", FilterOnMods).set("add", Add).set("remove", Remove).set("list", List),
    execute: () => void 0,
};

export default Filter;
