import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Disable from "./Disable.command";
import Enable from "./Enable.command";
import List from "./List.command";

const Preset: Command = {
    name: "preset",
    description: "Parent command for preset related commands",
    examples: ["enable slurs", "disable slurs"],
    aliases: ["presets"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("enable", Enable).set("disable", Disable).set("list", List),
    execute: () => void 0,
};

export default Preset;
