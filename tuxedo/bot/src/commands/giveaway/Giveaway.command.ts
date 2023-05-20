import { Collection } from "@discordjs/collection";
import { Category, Command } from "../commands";
import Start from "./Start.command";
import Stop from "./Stop.command";
import Conclude from "./Conclude.command";

const Giveaway: Command = {
    name: "giveaway",
    description: "Allows you to create and manage giveaways.",
    examples: [],
    parentCommand: true,
    category: Category.Events,
    // requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>().set("start", Start).set("conclude", Conclude).set("stop", Stop),
    execute: () => void 0,
};

export default Giveaway;