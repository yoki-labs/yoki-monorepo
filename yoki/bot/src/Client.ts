import { init } from "@amplitude/node";
import Collection from "@discordjs/collection";
import { Action, PrismaClient } from "@prisma/client";
import { S3 } from "aws-sdk";
import { Client,WebhookClient } from "guilded.js";
import EventEmitter from "node:events";
import type TypedEmitter from "typed-emitter";

import type { Command } from "./commands/Command";
import ActionIssued from "./events/other/ActionIssued";
import { ChannelUtil } from "./helpers/channel";
import { DatabaseUtil } from "./helpers/database";
import { MessageUtil } from "./helpers/message";
import { ServerUtil } from "./helpers/server";
import { MuteScheduler } from "./jobs/MuteScheduler";
import { ContentFilterUtil } from "./modules/content-filter";
import { LinkFilterUtil } from "./modules/link-filter";
import { SpamFilterUtil } from "./modules/spam-filter";
import type { Server } from "./typings";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class YokiClient extends Client {
	// user ID of the bot
	userId: string | null = null;
	// ID of the person who created the bot
	ownerId: string | null = null;
	// List of operators who have elevated permissions with the bot
	operators: string[] = [];

	// database connection
	readonly prisma = new PrismaClient();
	// s3 bucket
	readonly s3 = new S3({
		credentials: {
			accessKeyId: process.env.S3_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_KEY,
		},
	});

	// analytics
	readonly amp = init(process.env.AMPLITUDE_API_KEY!);

	// global collection of all timeouts within the bot so we can cancel them when the WS connection is severed
	readonly timeouts = new Collection<string, NodeJS.Timeout>();
	// global collection of all intervals within the bot so we can cancel them when the WS connection is severed
	readonly intervals = new Collection<string, NodeJS.Timer>();
	// webhook that sends to a specific channel for errors
	readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);
	// global collection of all the bots commands (parent commands, sub commands, etc.)
	readonly commands = new Collection<string, Command>();
	// utility methods for database interactions
	readonly dbUtil = new DatabaseUtil(this);
	// utility methods for message interactions
	readonly messageUtil = new MessageUtil(this);
	// utility methods for channel interactions
	readonly channelUtil = new ChannelUtil(this);
	// utility methods for server interactions
	readonly serverUtil = new ServerUtil(this);
	// utility methods for content filtering
	readonly contentFilterUtil = new ContentFilterUtil(this);
	// utility methods for preventing spam
	readonly spamFilterUtil = new SpamFilterUtil(this);
	// utility methods for filtering invites and blacklisted domains
	readonly linkFilterUtil = new LinkFilterUtil(this);

	// scheduler that will check for (impending) expired mutes and remove them
	readonly muteHandler = new MuteScheduler(this, 15 * 60);

	readonly emitter = new EventEmitter() as TypedEmitter<ClientCustomEvents>;
	readonly customEventHandler = {
		ActionIssued,
	};

	/** start the bot connection */
	init() {
		// starting the sweeper for mute scheduler
		this.muteHandler.init();
		// connecting to the WS gateway
		return this.login();
	}
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ClientCustomEvents = {
	ActionIssued: (data: Action, server: Server, client: YokiClient) => unknown;
};
