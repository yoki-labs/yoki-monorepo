import { PrismaClient } from "@prisma/client";
import { AbstractClient, MessageUtil, ServerUtil } from "@yokilabs/bot";

import ChatMessageCreated from "./events/ChatMessageCreated";
import { DatabaseUtil } from "./helpers/database";
import type { Command, Server } from "./typings";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class Client extends AbstractClient<Client, Server, Command> {
    // // ws manager
    // readonly ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
    // // rest manager
    // readonly rest = new RestManager({ token: process.env.GUILDED_TOKEN });
    // database connection
    readonly prisma = new PrismaClient();
    // // cache connection
    // readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    // // analytics
    // readonly amp = init(process.env.AMPLITUDE_API_KEY!);

    // // global collection of all timeouts within the bot so we can cancel them when the WS connection is severed
    // readonly timeouts = new Collection<string, NodeJS.Timeout>();
    // // global collection of all intervals within the bot so we can cancel them when the WS connection is severed
    // readonly intervals = new Collection<string, NodeJS.Timer>();
    // // webhook that sends to a specific channel for errors
    // readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);
    // // global collection of all the bots commands (parent commands, sub commands, etc.)
    // readonly commands = new Collection<string, Command>();

    // Util
    readonly serverUtil: ServerUtil<Client> = new ServerUtil<Client>(this);
    readonly messageUtil: MessageUtil<Client, Server, Command> = new MessageUtil<Client, Server, Command>(this);
    readonly dbUtil: DatabaseUtil = new DatabaseUtil(this);

    // events that this bot handles, directly from the ws manager
    readonly eventHandler: { [x: string]: (packet: any, ctx: Client, server: Server) => Promise<unknown> } = {
        // handles messages sent
        ChatMessageCreated,
    };
}
