import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Command, Category } from "../commands";
import Add from "./Add.command";
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
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>()
        .set("onmods", FilterOnMods)
        .set("spamfrequency", SpamFrequency)
        .set("mentionfrequency", MentionSpamFrequency)
        .set("spaminfractions", SpamInfractions)
        .set("add", Add)
        .set("remove", Remove)
        .set("list", List),
    execute: () => void 0,
};

export default Filter;
