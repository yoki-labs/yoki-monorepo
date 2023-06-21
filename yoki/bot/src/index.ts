import { errorEmbed, setClientCommands, setClientEvents } from "@yokilabs/bot";
import { config } from "dotenv";
import { join } from "path";

import YokiClient from "./Client";
import unhandledPromiseRejection from "./events/other/unhandledPromiseRejection";
import { eventErrorLoggerS3 } from "./utils/s3";

// Load env variables
config({ path: join(__dirname, "..", "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK", "S3_KEY_ID", "S3_SECRET_KEY", "S3_BUCKET"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new YokiClient({ token: process.env.GUILDED_TOKEN }, process.env.DEFAULT_PREFIX!);
client.ws.options.replayMissedEvents = false;

// Under client.eventHandler, we register a bunch of events that we can execute
// This makes it simple to add new events to our bot by just creating a file and adding it to that object.
// And any unhandled objects are simply ignored thanks to optional chaining
client.ws.emitter.on("gatewayEvent", async (event, data) => {
    const { serverId } = data.d as { serverId?: string | null };
    if (!serverId || ["XjBWymwR", "DlZMvw1R"].includes(serverId)) return;

    if (!client.eventHandler[event]) return;
    const serverFromDb = await client.dbUtil.getServer(serverId).catch((err) => unhandledPromiseRejection(err as Error, client));
    if (!serverFromDb || serverFromDb?.blacklisted) return void 0;
    return client.eventHandler[event]?.(data, client, serverFromDb).catch((err) =>
        client.errorHandler.send("Uncaught event error", [errorEmbed(err, { server: serverId, event })])
    );
});

client.ws.emitter.on("error", (err, errInfo, data) => {
    console.log(`[WS ERR]: ${err}\n  ${errInfo?.message}\n  [WS ERR STACK]:${errInfo?.stack}`);
    void client.errorHandler.send(`Error in command usage! ${err}`, [errorEmbed(err, data)]);
});

client.ws.emitter.on("exit", (reason) => {
    console.log(reason);
    // console.log("Restarting...");
    // process.exit(1);
});
client.rest.emitter.on("error", (req, res) => console.log(`[REST:ERR]: req - ${JSON.stringify(req)}\nRes - ${JSON.stringify(res)}`));
client.rest.emitter.on("ratelimit", (data) => console.log(`[RATELIMIT]: ${JSON.stringify(data)}`));

// This is for any custom events that we emit
client.emitter.on("ActionIssued", client.customEventHandler.ActionIssued);

// This handler is simply just to log errors to our Guilded channel.
process.on("unhandledRejection", (err) => unhandledPromiseRejection(err as Error, client));

void (async (): Promise<void> => {
    // Load all filse & directories in the commands dir recursively
    await setClientCommands(client, join(__dirname, "commands"));
    // Load guilded events
    await setClientEvents(client, join(__dirname, "events", "guilded"), eventErrorLoggerS3(client));

    try {
        // check if the main server exists and is in the database, this check is mostly to make sure our prisma migrations are applied
        const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
        if (!existingMainServer.length) await client.dbUtil.createFreshServerInDatabase(process.env.MAIN_SERVER, { flags: ["EARLY_ACCESS"] });
    } catch (e) {
        console.log(e);
        console.log("ERROR!: You have not applied the migrations. You must run 'pnpm migrate:dev'. Exiting...");
        await client.errorHandler
            .send(
                "URGENT! The prisma schema is OUT OF SYNC with the database. The bot WILL NOT start up until you fix this!! Run `pnpm migrate:dev` and commit the generation migrations ASAP."
            )
            .catch(() => null);
        return process.exit(1);
    }

    try {
        // connect ws connection
        await client.init();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
