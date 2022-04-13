import Collection from "@discordjs/collection";

import type { Command } from "../Command";
// import Infraction from "./Infraction.command";
import Modlog from "./ModLog.command";
import Modrole from "./Modrole.command";
import Muterole from "./Muterole.command";

const subCommands = new Collection<string, Command>()
    // .set("infraction", Infraction)
    .set("modlog", Modlog)
    .set("modrole", Modrole)
    .set("muterole", Muterole);

const Config: Command = {
    name: "config",
    description: "Set server-wide settings",
    usage: `<${subCommands.map((_v, k) => k).join(" | ")}> <..args>`,
    // examples: [...(Modlog.examples as string[]), ...(Modrole.examples as string[])],
    parentCommand: true,
    modOnly: true,
    ownerOnly: true,
    subCommands,
    execute: () => void 0,
};

export default Config;
