import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import List from "./List.command";
import Remove from "./Remove.command";
import Set from "./Set.command";
import Types from "./Types.command";

const subCommands = new Collection<string, Command>().set("types", Types).set("list", List).set("set", Set).set("remove", Remove);

const LogChannel: Command = {
    name: "logchannel",
    subName: "logchannel",
    category: Category.Logs,
    description: "Manage how logs are posted.",
    aliases: ["logs", "log"],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default LogChannel;
