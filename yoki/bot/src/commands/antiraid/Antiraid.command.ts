import { Collection } from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";
import Age from "./Age.command";
import Challenge from "./Challenge.command";
import Channel from "./Channel.command";

const subCommands = new Collection<string, Command>().set("challenge", Challenge).set("age", Age).set("channel", Channel);

const Antiraid: Command = {
    name: "antiraid",
    category: Category.Entry,
    module: "antiRaid",
    description: "Configure the anti-raid module for this server.",
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default Antiraid;
