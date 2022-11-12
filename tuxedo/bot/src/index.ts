import { config } from "dotenv";
import { join } from "path";

import { setClientCommands } from "../../../yoki-labs/bot/run";
import Client from "./Client";

// Load env variables
config({ path: join(__dirname, "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK", "S3_KEY_ID", "S3_SECRET_KEY", "S3_BUCKET"].forEach((x) => {
    if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new Client();

void (async (): Promise<void> => {
    await setClientCommands(client, join(__dirname, "commands"));

    // TODO: Server stuff
})();
