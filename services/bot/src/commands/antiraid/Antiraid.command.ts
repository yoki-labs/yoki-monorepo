import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import Age from "./Age.command";
import Challenge from "./Challenge.command";
import Channel from "./Channel.command";
import SpamFrequency from "./SpamFrequency.command";
import SpamInfractions from "./SpamInfractions.command";

const subCommands = new Collection<string, Command>()
    .set("spamfrequency", SpamFrequency)
    .set("spaminfractions", SpamInfractions)
    .set("challenge", Challenge)
    .set("age", Age)
    .set("channel", Channel);

const Antiraid: Command = {
    name: "antiraid",
    category: Category.Settings,
    description: "Configure the anti-raid module for this server.",
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    subCommands,
    execute: () => void 0,
};

export default Antiraid;
