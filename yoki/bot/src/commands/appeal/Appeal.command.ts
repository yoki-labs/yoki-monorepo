import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Channel from "./Channel.command";
import List from "./List.command";
import View from "./View.command";
import Delete from "./Delete.command";
import Accept from "./Accept.command";
import Decline from "./Decline.command";

const Appeal: Command = {
    name: "appeal",
    aliases: ["appeals"],
    description: "Manage server ban appeals.",
    parentCommand: true,
    module: "appeals",
    category: Category.Entry,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("list", List).set("view", View).set("accept", Accept).set("decline", Decline).set("delete", Delete).set("channel", Channel),
    execute: () => void 0,
};

export default Appeal;
