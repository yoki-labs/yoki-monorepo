import Collection from "@discordjs/collection";

import { Category } from "../../Category";
import type { Command } from "../../Command";
import Disable from "./Disable.command";
import Enable from "./Enable.command";

const Phrase: Command = {
    name: "presets-phrase",
    subName: "phrase",
    description: "Manages phrase/word presets.",
    examples: ["enable slurs", "disable slurs"],
    aliases: ["word", "content"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("enable", Enable).set("disable", Disable),
    execute: () => void 0,
};

export default Phrase;
