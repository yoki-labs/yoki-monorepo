import Collection from "@discordjs/collection";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import FilterOnMods from "./FilterOnMods.command";
import LinkSeverity from "./LinkSeverity";
import ModmailCategory from "./ModmailCategory.command";
import ModmailGroup from "./ModmailGroup.command";
// import Infraction from "./Infraction.command";
// import Modlog from "./ModLog.command";
import Modrole from "./Modrole.command";
import Muterole from "./Muterole.command";
import SpamFrequency from "./SpamFrequency.command";
import SpamInfractions from "./SpamInfractions.command";
import Threshold from "./Threshold.command";
import UrlWhitelist from "./UrlWhitelist.command";

const subCommands = new Collection<string, Command>()
    // .set("infraction", Infraction)
    // .set("modlog", Modlog)
    .set("modrole", Modrole)
    .set("muterole", Muterole)
    .set("filteronmods", FilterOnMods)
    .set("modmailgroup", ModmailGroup)
    .set("modmailcategory", ModmailCategory)
    .set("threshold", Threshold)
    .set("spamfrequency", SpamFrequency)
    .set("spaminfractions", SpamInfractions)
    .set("urlwhitelist", UrlWhitelist)
    .set("linkseverity", LinkSeverity);

const Config: Command = {
    name: "config",
    category: Category.Settings,
    description: "Set server-wide settings.",
    aliases: ["settings"],
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    requiredRole: RoleType.ADMIN,
    devOnly: true,
    subCommands,
    execute: () => void 0,
};

export default Config;
