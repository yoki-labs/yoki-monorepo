import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Add from "./Add.command";
import Ignore from "./Ignore.command";
import List from "./List.command";
import MentionSpamFrequency from "./MentionFrequency.command";
import FilterOnMods from "./Mods.command";
import Remove from "./Remove.command";
import SpamFrequency from "./SpamFrequency.command";
import SpamInfractions from "./SpamInfractions.command";

const Filter: Command = {
    name: "filter",
    description: "Configures content filtering.",
    examples: ["add test-word warn", "add another-test-word ban"],
    parentCommand: true,
    category: Category.Filter,
    subCommands: new Collection<string, Command>()
        .set("onmods", FilterOnMods)
        .set("spamfrequency", SpamFrequency)
        .set("mentionfrequency", MentionSpamFrequency)
        .set("spaminfractions", SpamInfractions)
        .set("add", Add)
        .set("remove", Remove)
        .set("list", List)
        .set("ignore", Ignore),
    execute: () => void 0,
};

export default Filter;
