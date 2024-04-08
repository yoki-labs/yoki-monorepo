import { codeBlock, errorEmbed, setClientCommands, setClientEvents } from "@yokilabs/bot";
import { config } from "dotenv";
import { WebhookEmbed } from "guilded.js";
import { join } from "path";

import { TuxoClient } from "./Client";

// Load env variables
config({ path: join(__dirname, "..", "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new TuxoClient({ token: process.env.GUILDED_TOKEN! }, process.env.DEFAULT_PREFIX!);

client.ws.emitter.on("error", (err) => {
    console.log(`[WS ERR]: ${err}`);
    void client.errorHandler.send("Error in command usage!", [new WebhookEmbed().setDescription("[WS ERR]:").addField(`Err`, codeBlock(err)).setColor("RED")]);
});

client.ws.emitter.on("gatewayEvent", async (event, data) => {
    const { serverId } = data.d as { serverId?: string | null };

    if (!serverId) return;

    const serverFromDb = await client.dbUtil
        .getServer(serverId)
        .catch((err) => void client.errorHandler.send("Error creating/fetching server for gateway event.", [errorEmbed(err as Error, { server: serverId, event })]));

    if (!serverFromDb || serverFromDb?.blacklisted || !serverFromDb.flags.includes("EARLY_ACCESS")) return;

    return client.eventHandler[event]?.(data, client, serverFromDb).catch((err) =>
        client.errorHandler.send("Uncaught event error", [errorEmbed(err, { server: serverId, event })])
    );
});

void (async (): Promise<void> => {
    await setClientCommands(client, join(__dirname, "commands"));
    await setClientEvents(client, join(__dirname, "events", "guilded"));

    try {
        // check if the main server exists and is in the database, this check is mostly to make sure our prisma migrations are applied
        const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
        if (!existingMainServer.length) await client.dbUtil.createFreshServerInDatabase(process.env.MAIN_SERVER!);
    } catch (e) {
        console.log(e);
        console.log("ERROR!: You have not applied the migrations. You must run 'pnpm migrate:dev'. Exiting...");
        return process.exit(1);
    }

    try {
        // connect redis & ws connection
        await client.init();

        await client.giveawayUtil.cacheGiveaways();
        client.giveawayUtil.tick();
        client.lifetimedUtil.tick();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
