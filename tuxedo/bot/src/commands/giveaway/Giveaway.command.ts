import { Collection } from "@discordjs/collection";

import { Category, Command } from "../commands";
import Conclude from "./Conclude.command";
import Start from "./Start.command";
import Stop from "./Stop.command";
import { RoleType } from "@prisma/client";
import Reroll from "./Reroll.command";

const Giveaway: Command = {
    name: "giveaway",
    description: "Allows you to create and manage giveaways.",
    examples: [],
    parentCommand: true,
    category: Category.Events,
    requiredRole: RoleType.MINIMOD,
    subCommands: new Collection<string, Command>().set("start", Start).set("conclude", Conclude).set("stop", Stop).set("reroll", Reroll),
    execute: () => void 0,
};

export default Giveaway;
