import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Mute from "./Mute.command";
import Staff from "./Staff.command";

const Role: Command = {
	name: "role",
	description: "Manages moderation roles.",
	usage: "<threshold> <..args>",
	examples: ["mute", "mute 12345678"],
	aliases: ["levels", "level", "modaction", "sv"],
	category: Category.Settings,
	parentCommand: true,
	subCommands: new Collection<string, Command>().set("staff", Staff).set("mute", Mute),
	execute: () => void 0,
};

export default Role;
