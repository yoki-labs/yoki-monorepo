import { config } from "dotenv";
import { join } from "path";
import recursive from "recursive-readdir";

import Client from "./Client";
import type { Command } from "./commands/Command";
import unhandledPromiseRejection from "./events/unhandledPromiseRejection";
import Welcome from "./events/Welcome";
config({ path: join(__dirname, "..", "..", "..", ".env") });

["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new Client();

client.ws.emitter.on("gatewayEvent", (event, data) => client.eventHandler[event]?.(data, client));
client.ws.emitter.on("ready", (data) => Welcome(data, client));

process.on("unhandledRejection", (err) => unhandledPromiseRejection(err as Error, client.errorHandler));

void (async (): Promise<void> => {
    const commandFiles = await recursive(join(__dirname, "commands"));
    for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
        const command = (await import(commandFile)).default as Command;
        console.log(`Loading command ${command.name}`);
        if (!command.name) {
            console.log(`ERROR loading ${commandFile}`);
            continue;
        }
        client.commands.set(command.name.toLowerCase(), command);
    }

    try {
        const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
        if (!existingMainServer.length) await client.serverUtil.createFreshServerInDatabase(process.env.MAIN_SERVER, { flags: ["EARLY_ACCESS"] });
    } catch (e) {
        console.log("ERROR!: You have not applied the migrations. You must run 'yarn migrate:dev' in the services/bot directory. Exiting...");
        return process.exit(1);
    }

    try {
        await client.ws.connect();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
