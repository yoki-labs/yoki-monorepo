import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import IgnoreChannel from "./Channel.command";
import IgnoreContent from "./Content.command";

const Ignore: Command = {
    name: "ignore",
    description: "Configures content filtering ignoring.",
    examples: ["channel channel_id"],
    parentCommand: true,
    category: Category.Filter,
    subCommands: new Collection<string, Command>().set("channel", IgnoreChannel).set("content", IgnoreContent),
    execute: () => void 0,
};

export default Ignore;
