import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import CategoryCommand from "./Category.command";
import Close from "./Close.command";
import Edit from "./Edit.command";
import Group from "./Group.command";
import History from "./History.command";
import Reply from "./Reply.command";
import SelectTrigger from "./SelectTrigger.command";
import SendTrigger from "./SendTrigger.command";

const Modmail: Command = {
    name: "modmail",
    description: "Parent command for modmail related commands.",
    aliases: ["m"],
    examples: ["modmail reply Hi, what can I help you with?"],
    parentCommand: true,
    category: Category.Modmail,
    subCommands: new Collection<string, Command>()
        .set("reply", Reply)
        .set("close", Close)
        .set("edit", Edit)
        .set("history", History)
        .set("selecttrigger", SelectTrigger)
        .set("sendtrigger", SendTrigger)
        .set("category", CategoryCommand)
        .set("group", Group),
    execute: () => void 0,
};

export default Modmail;
