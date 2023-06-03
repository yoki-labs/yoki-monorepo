import { Collection } from "@discordjs/collection";

import { Category, Command } from "../commands";
import Conclude from "./Conclude.command";
import Start from "./Start.command";
import Stop from "./Stop.command";
import { RoleType } from "@prisma/client";
import Reroll from "./Reroll.command";
import List from "./List.command";
import Info from "./Info.command";

const Giveaway: Command = {
    name: "giveaway",
    description: "Allows you to create and manage giveaways.",
    examples: [],
    aliases: ["give", "g"],
    parentCommand: true,
    category: Category.Events,
    requiredRole: RoleType.MINIMOD,
    subCommands: new Collection<string, Command>().set("start", Start).set("reroll", Reroll).set("conclude", Conclude).set("stop", Stop).set("list", List).set("info", Info),
    execute: () => void 0,
};

export default Giveaway;
