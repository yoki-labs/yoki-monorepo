import Collection from "@discordjs/collection";

import type { Command } from "../Command.spec";
import AddCommand from "./Add.command";
import DeleteCommand from "./Delete.command";

export default {
    name: "filter",
    description: "Parent command for filter related commands",
    aliases: ["words"],
    parentCommand: true,
    subCommands: new Collection().set("add", AddCommand).set("delete", DeleteCommand),
} as Command;
