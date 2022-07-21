import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import FilterOnMods from "./FilterOnMods.command";
import LogChannel from "./LogChannel.command";
import ModmailGroup from "./ModmailGroup.command";
// import Infraction from "./Infraction.command";
// import Modlog from "./ModLog.command";
import Modrole from "./Modrole.command";
import Muterole from "./Muterole.command";
import NsfwScan from "./NsfwScan";
import Threshold from "./Threshold.command";

const subCommands = new Collection<string, Command>()
    // .set("infraction", Infraction)
    // .set("modlog", Modlog)
    .set("modrole", Modrole)
    .set("muterole", Muterole)
    .set("filteronmods", FilterOnMods)
    .set("logchannel", LogChannel)
    .set("modmailgroup", ModmailGroup)
    .set("threshold", Threshold)
    .set("nsfwscan", NsfwScan);

const Config: Command = {
    name: "config",
    category: Category.Settings,
    description: "Set server-wide settings",
    aliases: ["settings"],
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    devOnly: true,
    subCommands,
    execute: () => void 0,
};

export default Config;
