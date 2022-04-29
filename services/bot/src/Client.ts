import Collection from "@discordjs/collection";
import { RestManager } from "@guildedjs/rest";
import { WebhookClient } from "@guildedjs/webhook-client";
import { WebSocketManager } from "@guildedjs/ws";
import { PrismaClient } from "@prisma/client";
import RedisClient from "ioredis";

import type { Command } from "./commands/Command";
import ChatMessageCreated from "./events/ChatMessageCreated";
import ChatMessageDeleted from "./events/ChatMessageDeleted";
import ChatMessageUpdated from "./events/ChatMessageUpdated";
import TeamMemberUpdated from "./events/TeamMemberUpdated";
import teamRolesUpdated from "./events/teamRolesUpdated";
import { ContentFilterUtil } from "./functions/content-filter";
import { DatabaseUtil } from "./functions/database";
import { MessageUtil } from "./functions/message";
import { ServerUtil } from "./functions/server";
import { MuteScheduler } from "./jobs/MuteScheduler";
import type { Context } from "./typings";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class Client {
    // user ID of the bot
    userId: string | null = null;
    // ID of the person who created the bot
    ownerId: string | null = null;
    // List of operators who have elevated permissions with the bot
    operators: string[] = [];

    // ws manager
    readonly ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
    // rest manager
    readonly rest = new RestManager({ token: process.env.GUILDED_TOKEN });
    // database connection
    readonly prisma = new PrismaClient();
    // cache connection
    readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    // global collection of all timeouts within the bot so we can cancel them when the WS connection is severed
    readonly timeouts = new Collection<string, NodeJS.Timeout>();
    // global collection of all intervals within the bot so we can cancel them when the WS connection is severed
    readonly intervals = new Collection<string, NodeJS.Timer>();
    // webhook that sends to a specific channel for errors
    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);
    // global collection of all the bots commands (parent commands, sub commands, etc.)
    readonly commands = new Collection<string, Command>();
    // utility methods for message interactions
    readonly messageUtil = new MessageUtil(this);
    // utility methods for server interactions
    readonly serverUtil = new ServerUtil(this);
    // utility methods for content filtering
    readonly contentFilterUtil = new ContentFilterUtil(this);
    // utility methods for database interactions
    readonly dbUtil = new DatabaseUtil(this);

    // scheduler that will check for (impending) expired mutes and remove them
    readonly muteHandler = new MuteScheduler(this, 15 * 60);

    // events that this bot handles, directly from the ws manager
    readonly eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
        // handles messages sent
        ChatMessageCreated,
        // handles messages updated
        ChatMessageUpdated,
        // handles messages deleted
        ChatMessageDeleted,
        // handles nickname updates and other member data
        TeamMemberUpdated,
        // handles members getting new roles
        teamRolesUpdated,
    };

    /** start the bot connection */
    init() {
        // starting the sweeper for mute scheduler
        this.muteHandler.init();
        // connecting to the WS gateway
        return this.ws.connect();
    }
}
