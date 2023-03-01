import { config } from "dotenv";
import type { ClientEvents } from "guilded.js";
import { join } from "path";
import recursive from "recursive-readdir";

import YokiClient from "./Client";
import type { Command } from "./commands/Command";
import unhandledPromiseRejection from "./events/other/unhandledPromiseRejection";
import type { GEvent } from "./typings";
import { errorEmbed } from "./utils/formatters";

// Load env variables
config({ path: join(__dirname, "..", "..", "..", ".env") });

// Check ENV variables to ensure we have the necessary things to start the bot up
["DEFAULT_PREFIX", "GUILDED_TOKEN", "DATABASE_URL", "MAIN_SERVER", "ERROR_WEBHOOK", "S3_KEY_ID", "S3_SECRET_KEY", "S3_BUCKET"].forEach((x) => {
	if (!process.env[x]) throw new Error(`Missing env var ${x}`);
});

const client = new YokiClient({ token: process.env.GUILDED_TOKEN });

client.ws.emitter.on("error", (err, errInfo, data) => {
	console.log(`[WS ERR]: ${err}\n  ${errInfo?.message}\n  [WS ERR STACK]:${errInfo?.stack}`);
	void client.errorHandler.send(`Error in command usage! ${err}`, [errorEmbed(err, data)]);
});

// This is for any custom events that we emit
client.emitter.on("ActionIssued", client.customEventHandler.ActionIssued);

// This handler is simply just to log errors to our Guilded channel.
process.on("unhandledRejection", (err) => unhandledPromiseRejection(err as Error, client));

void (async (): Promise<void> => {
	// Load all filse & directories in the commands dir recursively
	const commandFiles = await recursive(join(__dirname, "commands"));
	// Load guilded events
	const eventFiles = await recursive(join(__dirname, "events", "guilded"));

	// go through every file that ends with .command.js (so we can ignore non-command files)
	for (const commandFile of commandFiles.filter((x) => x.endsWith(".command.js"))) {
		// load command file's default export
		const command = (await import(commandFile)).default as Command;
		if (!command.name) {
			console.log(`ERROR loading command ${commandFile}`);
			continue;
		}
		console.log(`Loading command ${command.name}`);
		// add command to our global collection of commands
		client.commands.set(command.name.toLowerCase(), command);
	}

	for(const eventFile of eventFiles.filter((x) => !x.endsWith(".ignore.ts"))) {
		const event = (await import(eventFile)).default as GEvent<any>;
		if(!event.name) {
			console.log(`ERROR loading event ${eventFile}`);
			continue;
		}
		console.log(`Loading event ${event.name}`);
		client.on(event.name, async (args: Parameters<ClientEvents[keyof ClientEvents]>) => {
			try {
				await event.execute([...args, client]);
			} catch(err) {
				void client.errorHandler.send("Uncaught event error", [errorEmbed(err)])
			}
		});
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
