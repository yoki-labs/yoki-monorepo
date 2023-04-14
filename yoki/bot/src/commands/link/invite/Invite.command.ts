import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../../commands";
import Add from "./Add.command";
import Remove from "./Remove.command";

const Invite: Command = {
    name: "link-invite",
    subName: "invite",
    description: "Manages invite whitelist.",
    examples: ["add api-official"],
    parentCommand: true,
    subCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("add", Add).set("remove", Remove),
    execute: () => void 0,
};

export default Invite;
