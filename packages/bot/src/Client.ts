import { init } from "@amplitude/node";
import { Collection } from "@discordjs/collection";
import FormData from "form-data";
import { Client, ClientOptions, RestManager, WebhookClient } from "guilded.js";

// import RedisClient from "ioredis";
import type { BaseCommand } from "./commands/command-typings";
import type { IServer } from "./db-types";
import Welcome from "./events/Welcome";
import type { MessageUtil } from "./helpers/message";
import type { RoleUtil } from "./helpers/role";

export type AnyClient = AbstractClient<any, any, any>;

const defaultHeaders = { "x-guilded-bot-api-use-official-markdown": "true" };

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export abstract class AbstractClient<
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
    // readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    readonly startTime = new Date();

    // analytics
    readonly amp = init(process.env.AMPLITUDE_API_KEY!);

    // global collection of all timeouts within the bot so we can cancel them when the WS connection is severed
    readonly timeouts = new Collection<string, NodeJS.Timeout>();

    // global collection of all intervals within the bot so we can cancel them when the WS connection is severed
    readonly intervals = new Collection<string, NodeJS.Timer>();

    // webhook that sends to a specific channel for errors
    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK!);

    readonly commandLogHandler = new WebhookClient(process.env.COMMAND_LOG_WEBHOOK!);

    // global collection of all the bots commands (parent commands, sub commands, etc.)
    readonly commands = new Collection<string, TCommand>();

    // Client API rest manager
    readonly clientApiRest: RestManager;

    // Client API rest manager
    readonly mediaApiRest: RestManager;

    // Util
    abstract roleUtil: RoleUtil<TClient>;

    abstract messageUtil: MessageUtil<TClient, TServer, TCommand>;

    // events that this bot handles, directly from the ws manager
    abstract eventHandler: { [x: string]: (packet: any, ctx: TClient, server: TServer) => Promise<unknown> | undefined };

    constructor({ rest, ws, ...options }: ClientOptions, prefix: string) {
        super({ rest: { headers: defaultHeaders, ...rest }, ws: { headers: defaultHeaders, ...ws }, ...options });

        this.prefix = prefix;
        this.clientApiRest = new RestManager({ token: options.token, proxyURL: "https://www.guilded.gg/api" });
        this.mediaApiRest = new RestManager({ token: options.token, proxyURL: "https://media.guilded.gg/media" });
    }

    async uploadMedia(buffer: Buffer, filename?: string, contentType?: string) {
        const formData = new FormData();

        formData.append("uploadTrackingId", `r-${generateFormIdNum()}-${generateFormIdNum()}`);
        formData.append("file", buffer, { filename, contentType });

        const [, response] = await this.mediaApiRest.make(
            {
                path: "/upload",
                isFormData: true,
                method: "POST",
                body: formData,
                query: { dynamicMediaTypeId: "ContentMedia" },
            },
            true,
            1,
            { bodyIsJSON: false }
        );

        return ((await response) as { url: string }).url;
    }

    /** Start the bot connection */
    init() {
        this.on("ready", () => Welcome(this));

        return this.login();
    }
}

const generateFormIdNum = () => Math.floor(Math.random() * 9999999) + 1000000;
