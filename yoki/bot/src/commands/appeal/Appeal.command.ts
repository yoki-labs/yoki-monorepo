import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Channel from "./Channel.command";

const Appeal: Command = {
    name: "appeal",
    aliases: ["appeals"],
    description: "Configures appeal accepting.",
    parentCommand: true,
    module: "appeals",
    category: Category.Entry,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>().set("channel", Channel),
    execute: () => void 0,
};

export default Appeal;
