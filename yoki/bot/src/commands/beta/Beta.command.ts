import { Collection } from "@discordjs/collection";

import type { Command } from "../commands";
import Enroll from "./Enroll.command";
import Remove from "./Remove.command";

const subCommands = new Collection<string, Command>().set("remove", Remove).set("enroll", Enroll);

const Beta: Command = {
    name: "beta",
    description: "Beta program parent command.",
    usage: `<${subCommands.map((_v, k) => k).join(" | ")}> <..args>`,
    parentCommand: true,
    hidden: true,
    devOnly: true,
    subCommands,
    execute: () => void 0,
};

export default Beta;
