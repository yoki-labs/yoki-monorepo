import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import IgnoreChannel from "./Channel.command";
import IgnoreContent from "./Content.command";

const Ignore: Command = {
    name: "ignore",
    description: "Manage content filtering and auto-mod exceptions.",
    examples: ["channel channel_id"],
    parentCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>().set("channel", IgnoreChannel).set("content", IgnoreContent),
    execute: () => void 0,
};

export default Ignore;
