import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
// import CategoryCommand from "./Category.command";
import Close from "./Close.command";
// import Group from "./Group.command";
import History from "./History.command";
import SendTrigger from "./SendTrigger.command";
import SetTrigger from "./SetTrigger.command";

const Modmail: Command = {
    name: "modmail",
    description: "Manage modmail/ticket system.",
    aliases: ["m"],
    module: "modmail",
    examples: ["reply Hi, what can I help you with?"],
    parentCommand: true,
    category: Category.Modmail,
    requiredRole: RoleType.MINIMOD,
    subCommands: new Collection<string, Command>()
        .set("close", Close)
        .set("history", History)
        .set("settrigger", SetTrigger)
        .set("sendtrigger", SendTrigger),
    // .set("category", CategoryCommand)
    // .set("group", Group)
    // .set("pingrole", PingRole),
    execute: () => void 0,
};

export default Modmail;
