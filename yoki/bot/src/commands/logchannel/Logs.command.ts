import { Collection } from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category,Command } from "../commands";
import List from "./List.command";
import Remove from "./Remove.command";
import Set from "./Set.command";
import Types from "./Types.command";

const subCommands = new Collection<string, Command>().set("types", Types).set("list", List).set("set", Set).set("remove", Remove);

const LogChannel: Command = {
	name: "logs",
	subName: "logs",
	category: Category.Logs,
	description: "Manage how logs are posted.",
	aliases: ["logchannel", "log"],
	parentCommand: true,
	requiredRole: RoleType.ADMIN,
	subCommands,
	execute: () => void 0,
};

export default LogChannel;
