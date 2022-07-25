import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import List from "./logchannel/List.command";
import Remove from "./logchannel/Remove.command";
import Set from "./logchannel/Set.command";
import Types from "./logchannel/Types.command";

const subCommands = new Collection<string, Command>().set("types", Types).set("list", List).set("set", Set).set("remove", Remove);

const LogChannel: Command = {
    name: "config-logchannel",
    subName: "logchannel",
    category: Category.Settings,
    description: "Manage your log channel's.",
    aliases: ["logs"],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    devOnly: true,
    subCommands,
    execute: () => void 0,
};

export default LogChannel;
