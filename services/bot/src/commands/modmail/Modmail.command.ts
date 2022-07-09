import Collection from "@discordjs/collection";

import { Category } from "../Category";
import type { Command } from "../Command";
import Close from "./Close.command";
import Edit from "./Edit.command";
import History from "./History.command";
import Reply from "./Reply.command";
import SendTrigger from "./SendTrigger.command";

const Modmail: Command = {
    name: "modmail",
    description: "Parent command for modmail related commands",
    aliases: ["m"],
    examples: ["modmail reply Hi, what can I help you with?"],
    parentCommand: true,
    category: Category.Moderation,
    subCommands: new Collection<string, Command>().set("reply", Reply).set("close", Close).set("edit", Edit).set("history", History).set("sendtrigger", SendTrigger),
    execute: () => void 0,
};

export default Modmail;
