import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import List from "./List.command";
import Phrase from "./phrase/Phrase.command";
import Url from "./url/Url.command";

const Preset: Command = {
    name: "preset",
    description: "Parent command for preset related commands.",
    examples: ["enable slurs", "disable slurs"],
    aliases: ["presets"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("phrase", Phrase).set("url", Url).set("list", List),
    execute: () => void 0,
};

export default Preset;
