import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import WelcomeChannel from "./Channel.command";

const Welcome: Command = {
    name: "welcome",
    description: "Manage post-antiraid welcomer.",
    aliases: ["w"],
    module: "welcome",
    examples: ["channel #welcome"],
    parentCommand: true,
    category: Category.Entry,
    requiredRole: RoleType.MINIMOD,
    subCommands: new Collection<string, Command>()
        .set("channel", WelcomeChannel),
    execute: () => void 0,
};

export default Welcome;
