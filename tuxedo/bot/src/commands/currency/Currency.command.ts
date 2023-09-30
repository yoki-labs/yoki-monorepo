import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import CanDeposit from "./CanDeposit.command";
import Create from "./Create.command";
import Delete from "./Delete.command";
import Emote from "./Emote.command";
import Info from "./Info.command";
import List from "./List.command";
import Maximum from "./Max.command";
import Name from "./Name.command";
import Starting from "./Starting.command";
import Tag from "./Tag.command";

const Currency: Command = {
    name: "currency",
    description: "Allows you to manage currencies and some economy aspects.",
    examples: [],
    parentCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    subCommands: new Collection<string, Command>()
        .set("create", Create)
        .set("list", List)
        .set("info", Info)
        .set("delete", Delete)
        .set("name", Name)
        .set("tag", Tag)
        .set("maximum", Maximum)
        .set("starting", Starting)
        .set("emote", Emote)
        .set("candeposit", CanDeposit),
    execute: () => void 0,
};

export default Currency;
