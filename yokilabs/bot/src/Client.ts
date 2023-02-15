import { init } from "@amplitude/node";
import { Collection } from "@discordjs/collection";
import { RestManager } from "@guildedjs/rest";
import { WebhookClient } from "@guildedjs/webhook-client";
import { WebSocketManager } from "@guildedjs/ws";
import RedisClient from "ioredis";

import type { BaseCommand } from "./commands/command-typings";
import type { IServer } from "./db-types";
import Welcome from "./events/Welcome";
import type MessageUtil from "./helpers/message";
import type ServerUtil from "./helpers/server";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default abstract class AbstractClient<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, string, TServer>
> {
    // user ID of the bot
    userId: string | null = null;
    // ID of the person who created the bot
    ownerId: string | null = null;
    // List of operators who have elevated permissions with the bot
    operators: string[] = [];

    prefix: string;

    // ws manager
    readonly ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN! });
    // rest manager
    readonly rest = new RestManager({ token: process.env.GUILDED_TOKEN! });
    // // database connection
    // readonly prisma = new PrismaClient();
    // cache connection
    readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    // analytics
    readonly amp = init(process.env.AMPLITUDE_API_KEY!);

    // global collection of all timeouts within the bot so we can cancel them when the WS connection is severed
    readonly timeouts = new Collection<string, NodeJS.Timeout>();
    // global collection of all intervals within the bot so we can cancel them when the WS connection is severed
    readonly intervals = new Collection<string, NodeJS.Timer>();
    // webhook that sends to a specific channel for errors
    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK!);
    // global collection of all the bots commands (parent commands, sub commands, etc.)
    readonly commands = new Collection<string, TCommand>();

    // Util
    abstract serverUtil: ServerUtil<TClient>;
    abstract messageUtil: MessageUtil<TClient, TServer, TCommand>;

    // events that this bot handles, directly from the ws manager
    abstract eventHandler: { [x: string]: (packet: any, ctx: TClient, server: TServer) => Promise<unknown> | undefined };

    constructor(prefix: string) {
        // On welcome message
        this.ws.emitter.on("ready", (data) => Welcome(data, this));

        this.prefix = prefix;
    }

    /** Start the bot connection */
    init() {
        // Connecting to the WS gateway
        return this.ws.connect();
    }
}
