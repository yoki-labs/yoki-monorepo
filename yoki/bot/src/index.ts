import type { WSBotTeamMembershipCreated } from "@guildedjs/guilded-api-typings";
import { config } from "dotenv";
import { join } from "path";
import recursive from "recursive-readdir";

import Client from "./Client";
import type { Command } from "./commands/Command";
import BotServerMembershipCreated from "./events/BotServerMembershipCreated";
import unhandledPromiseRejection from "./events/unhandledPromiseRejection";
import Welcome from "./events/Welcome";
import { errorEmbed } from "./utils/formatters";

// Load env variables
config({ path: join(__dirname, "..", "..", "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK", "S3_KEY_ID", "S3_SECRET_KEY", "S3_BUCKET"].forEach((x) => {
	if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new Client();

// Under client.eventHandler, we register a bunch of events that we can execute
// This makes it simple to add new events to our bot by just creating a file and adding it to that object.
// And any unhandled objects are simply ignored thanks to optional chaining
client.ws.emitter.on("gatewayEvent", async (event, data) => {
	if (event === "BotTeamMembershipCreated") return BotServerMembershipCreated(data as WSBotTeamMembershipCreated, client);
	const { serverId } = data.d as { serverId?: string | null };
	if (!serverId || ["XjBWymwR", "DlZMvw1R"].includes(serverId)) return;

	const serverFromDb = await client.dbUtil.getServer(serverId).catch((err) =>
		void client.errorHandler.send("Error creating/fetching server for gateway event.", [errorEmbed(err, { server: serverId, event })])
	);
	if (!serverFromDb || serverFromDb?.blacklisted) return void 0;
	return client.eventHandler[event]?.(data, client, serverFromDb).catch((err) =>
		client.errorHandler.send("Uncaught event error", [errorEmbed(err, { server: serverId, event })])
	);
});

client.ws.emitter.on("error", (err, errInfo, data) => {
	console.log(`[WS ERR]: ${err}\n  ${errInfo?.message}\n  [WS ERR STACK]:${errInfo?.stack}`);
	void client.errorHandler.send(`Error in command usage! ${err}`, [errorEmbed(err, data)]);
});

// This is for any custom events that we emit
client.emitter.on("ActionIssued", client.customEventHandler.ActionIssued);

// This event accepts the welcome data that allows us to get the botId and creatorId
client.ws.emitter.on("ready", (data) => Welcome(data, client));

// This handler is simply just to log errors to our Guilded channel.
process.on("unhandledRejection", (err) => unhandledPromiseRejection(err as Error, client.errorHandler));

void (async (): Promise<void> => {
	// Load all filse & directories in the commands dir recursively
	const commandFiles = await recursive(join(__dirname, "commands"));

	// go through every file that ends with .command.js (so we can ignore non-command files)
	for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
		// load command file's default export
		const command = (await import(commandFile)).default as Command;
		console.log(`Loading command ${command.name}`);
		if (!command.name) {
			console.log(`ERROR loading ${commandFile}`);
			continue;
		}
		// add command to our global collection of commands
		client.commands.set(command.name.toLowerCase(), command);
	}

	try {
		// check if the main server exists and is in the database, this check is mostly to make sure our prisma migrations are applied
		const existingMainServer = await client.prisma.server.findMany({ where: { serverId: process.env.MAIN_SERVER } });
		if (!existingMainServer.length) await client.dbUtil.createFreshServerInDatabase(process.env.MAIN_SERVER, { flags: ["EARLY_ACCESS"] });
	} catch (e) {
		console.log(e);
		console.log("ERROR!: You have not applied the migrations. You must run 'yarn migrate:dev'. Exiting...");
		await client.errorHandler.send("URGENT! The prisma schema is OUT OF SYNC with the database. The bot WILL NOT start up until you fix this!! Run `yarn migrate:dev` and commit the generation migrations ASAP.").catch(() => null)
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
