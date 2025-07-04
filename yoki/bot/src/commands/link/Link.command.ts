import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Invite from "./invite/Invite.command";
import List from "./List.command";
import Severity from "./Severity.command";
import Url from "./url/Url.command";

const Link: Command = {
    name: "link",
    description: "Manage domain and invite filter lists.",
    examples: ["domain add example.com warn", "invite add 4R56dNkl"],
    parentCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("url", Url).set("invite", Invite).set("list", List).set("severity", Severity),
    execute: () => void 0,
};

export default Link;
