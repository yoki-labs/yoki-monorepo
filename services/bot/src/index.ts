import { config } from "dotenv";
import { join } from "path";
import recursive from "recursive-readdir";

import Client from "./Client";
import type { Command } from "./commands/Command";
import unhandledPromiseRejection from "./events/unhandledPromiseRejection";
config({ path: join(__dirname, "..", "..", "..", ".env") });

["BOT_ID", "DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "BOT_OWNER", "ERROR_WEBHOOK"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new Client();

client.ws.emitter.on("gatewayEvent", (event, data) => client.eventHandler[event]?.(data, client));
client.ws.emitter.on("ready", () => console.log("WS is ready to receive events!"));

process.on("unhandledRejection", (err) => unhandledPromiseRejection(err as Error, client.errorHandler));

void (async (): Promise<void> => {
    const commandFiles = await recursive(join(__dirname, "commands"));
    for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
        const command = (await import(commandFile)).default as Command;
        console.log(`Loading command ${command.name}`);
        client.commands.set(command.name.toLowerCase(), command);
    }

    try {
        await client.ws.connect();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
