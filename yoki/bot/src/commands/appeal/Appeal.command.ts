import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Channel from "./Channel.command";
import List from "./List.command";
import View from "./View.command";

const Appeal: Command = {
    name: "appeal",
    aliases: ["appeals"],
    description: "Configures appeal accepting.",
    parentCommand: true,
    module: "appeals",
    category: Category.Entry,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>()
        .set("list", List)
        .set("view", View)
        .set("channel", Channel),
    execute: () => void 0,
};

export default Appeal;
