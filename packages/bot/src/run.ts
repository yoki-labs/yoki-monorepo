import type { ClientEvents } from "guilded.js";
import recursive from "recursive-readdir";

import type { AbstractClient } from "./Client";
import type { BaseCommand } from "./commands/command-typings";
import type { GEvent } from "./typings";
import { errorEmbed } from "./utils/formatting";

export async function setClientCommands<TClient extends AbstractClient<TClient, any, any>>(client: TClient, dir: string) {
    // Load all filse & directories in the commands dir recursively
    const commandFiles = await recursive(dir);

    // go through every file that ends with .command.js (so we can ignore non-command files)
    for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
        // load command file's default export
        const command = (await import(commandFile)).default as BaseCommand<any, TClient, any, any>;
        if (!command.name) {
            console.log(`ERROR loading command ${commandFile}`);
            continue;
        }
        console.log(`Loading command ${command.name}`);
        // add command to our global collection of commands
        client.commands.set(command.name.toLowerCase(), command);
    }
}
export async function setClientEvents<TClient extends AbstractClient<TClient, any, any>>(
    client: TClient,
    dir: string,
    errorLogger?: (event: string, content: string) => Promise<unknown>
) {
    // Load guilded events
    const eventFiles = await recursive(dir);

    for (const eventFile of eventFiles.filter((x) => !x.endsWith(".ignore.js") && !x.endsWith(".map"))) {
        const event = (await import(eventFile)).default as GEvent<TClient, any>;
        if (!event.name) {
            console.log(`ERROR loading event ${eventFile}`);
            continue;
        }
        console.log(`Loading event ${event.name}`);
        client.on(event.name, async (...args: Parameters<ClientEvents[keyof ClientEvents]>) => {
            try {
                // @ts-ignore this is valid
                if (["XjBWymwR", "DlZMvw1R"].includes(args[0]?.serverId)) return;
                await event.execute([...args, client]);
            } catch (err) {
                const errorContent = JSON.stringify(err);
                if (!errorLogger) {
                    void client.errorHandler.send("Uncaught event error", [errorEmbed((err as Error).stack!)]);
                }

                return errorLogger?.(event.name, errorContent);
            }
        });
    }
}
