import { writeFileSync } from "fs";
import { join } from "path";
import recursive from "recursive-readdir";

import type { Command } from "../src/commands/Command";

void (async () => {
    const commandFiles = await recursive(join(__dirname, "..", "dist", "commands"));
    const commands = commandFiles
        .filter((x) => x.endsWith(".command.js"))
        .map((x) => require(x).default as Command)
        .filter((x) => (!x.hidden && !x.subCommand) || x.forceShow);
    writeFileSync(
        join(__dirname, "..", "..", "site", "commands.json"),
        JSON.stringify(
            commands.map((command) => {
                return {
                    name: command.name,
                    category: command.category,
                    description: command.description,
                    usage: command.usage ?? `<${command.subCommands?.size ? command.subCommands!.map((x) => x.subName!).join(" | ") : ""}> <...args>`,
                    args: command.args,
                    examples: command.examples?.map((x) => `?${command.name} ${x}`),
                    requiredRole: command.requiredRole,
                    aliases: command.aliases,
                    subCommand: command.subCommand,
                    subCommands: command.subCommands,
                    clientPermissions: command.clientPermissions,
                    userPermissions: command.userPermissions,
                };
            })
        )
    );
})();
