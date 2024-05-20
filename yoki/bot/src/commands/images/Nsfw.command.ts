import { Collection } from "@discordjs/collection";
import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import Confidence from "./Confidence.command";
import Severity from "./Severity.command";

const Nsfw: Command = {
    name: "nsfw",
    description: "Manage image filtering.",
    examples: ["severity warn 5", "confidence 0.75 0.5"],
    parentCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.MOD,
    subCommands: new Collection<string, Command>().set("confidence", Confidence).set("severity", Severity),
    execute: () => void 0,
};

export default Nsfw;
