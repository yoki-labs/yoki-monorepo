import recursive from "recursive-readdir";

import type AbstractClient from "./Client";
import type { BaseCommand } from "./commands/command-typings";

export async function setClientCommands<TClient extends AbstractClient<TClient, any, any>>(client: TClient, dir: string) {
    // Load all filse & directories in the commands dir recursively
    const commandFiles = await recursive(dir);

    // Go through every file that ends with .command.js (so we can ignore non-command files)
    for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
        // Load command file's default export
        const command = (await import(commandFile)).default as BaseCommand<any, TClient, string, any>;
        console.log(`Loading command ${command.name}`);
        if (!command.name) {
            console.log(`ERROR loading command ${commandFile}`);
            continue;
        }
        // Add command to our global collection of commands
        client.commands.set(command.name.toLowerCase(), command);
    }
}
