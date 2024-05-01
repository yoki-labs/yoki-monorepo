import { codeBlock, errorEmbed, setClientCommands, setClientEvents } from "@yokilabs/bot";
import { config } from "dotenv";
import { WebhookEmbed } from "guilded.js";
import { join } from "path";

import { TestClient } from "./Client";
import CustomWsManager from "./CustomWsManager";

// Load env variables
config({ path: join(__dirname, "..", "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "MAIN_SERVER_DEV_ROLE_ID", "ERROR_WEBHOOK"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new TestClient({ token: process.env.GUILDED_TOKEN! }, process.env.DEFAULT_PREFIX!);

client.ws = new CustomWsManager({ token: process.env.GUILDED_TOKEN! });

client.ws.emitter.on("error", (err) => {
    console.log(`[WS ERR]: ${err}`);
    void client.errorHandler.send("Error in command usage!", [new WebhookEmbed().setDescription("[WS ERR]:").addField(`Err`, codeBlock(err)).setColor("RED")]);
});

client.ws.emitter.on("gatewayEvent", async (event, data) => {
    const { serverId } = data.d as { serverId?: string | null };

    // console.log("Event data", data);

    if (!serverId) return;

    return client.eventHandler[event]?.(data, client, { prefix: null }).catch((err) =>
        client.errorHandler.send("Uncaught event error", [errorEmbed(err, { server: serverId, event })])
    );
});

void (async (): Promise<void> => {
    await setClientCommands(client, join(__dirname, "commands"));
    await setClientEvents(client, join(__dirname, "events", "guilded"));

    try {
        // connect redis & ws connection
        await client.init();
    } catch (e) {
        console.error(e);
        return process.exit(1);
    }
})();
