import { init } from "@amplitude/node";
import { Collection } from "@discordjs/collection";
import { Client, ClientOptions, WebhookClient } from "guilded.js";
import RedisClient from "ioredis";

import type { BaseCommand } from "./commands/command-typings";
import type { IServer } from "./db-types";
import Welcome from "./events/Welcome";
import type MessageUtil from "./helpers/message";
import type RoleUtil from "./helpers/role";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default abstract class AbstractClient<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, string, TServer>
> extends Client {
    // List of operators who have elevated permissions with the bot
    operators: string[] = [];

    prefix: string;

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
    abstract roleUtil: RoleUtil<TClient>;
    abstract messageUtil: MessageUtil<TClient, TServer, TCommand>;

    // events that this bot handles, directly from the ws manager
    abstract eventHandler: { [x: string]: (packet: any, ctx: TClient, server: TServer) => Promise<unknown> | undefined };

    constructor(options: ClientOptions, prefix: string) {
        super(options);

        this.prefix = prefix;
    }

    /** Start the bot connection */
    init() {
        this.on("ready", () => Welcome(this));
        // Connecting to the WS gateway
        return this.ws.connect();
    }
}
