import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Member from "./Member.command";
import Mute from "./Mute.command";
import Staff from "./Staff.command";

const Role: Command = {
    name: "role",
    description: "Manages moderation roles.",
    // usage: "<threshold> <..args>",
    examples: ["mute", "mute 12345678"],
    aliases: ["roles", "r"],
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    parentCommand: true,
    subCommands: new Collection<string, Command>().set("staff", Staff).set("mute", Mute).set("member", Member),
    execute: () => void 0,
};

export default Role;
