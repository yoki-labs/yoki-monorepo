import Collection from "@discordjs/collection";

import { Category } from "../../Category";
import type { Command } from "../../Command";
import Disable from "./Disable.command";
import Enable from "./Enable.command";

const Url: Command = {
    name: "presets-url",
    subName: "url",
    description: "Manages URL and domain presets.",
    examples: ["enable slurs", "disable slurs"],
    aliases: ["link", "domain"],
    category: Category.Settings,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("enable", Enable).set("disable", Disable),
    execute: () => void 0,
};

export default Url;
