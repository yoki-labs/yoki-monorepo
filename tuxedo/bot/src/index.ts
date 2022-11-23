import { setClientCommands } from "@yokilabs/bot";
import { config } from "dotenv";
import { join } from "path";

import Client from "./Client";

// Load env variables
config({ path: join(__dirname, "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new Client();

void (async (): Promise<void> => {
    await setClientCommands(client, join(__dirname, "commands"));

    try {
        // check if the main server exists and is in the database, this check is mostly to make sure our prisma migrations are applied
        const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
        if (!existingMainServer.length) await client.dbUtil.createFreshServerInDatabase(process.env.MAIN_SERVER!);
    } catch (e) {
        console.log(e);
        console.log("ERROR!: You have not applied the migrations. You must run 'yarn migrate:dev'. Exiting...");
        return process.exit(1);
    }

    try {
        // connect redis & ws connection
        await client.init();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
