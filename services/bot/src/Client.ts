import Collection from "@discordjs/collection";
import REST from "@guildedjs/rest";
import { WebhookClient } from "@guildedjs/webhook-client";
import WebSocketManager from "@guildedjs/ws";
import { PrismaClient } from "@prisma/client";
import RedisClient from "ioredis";

import type { Command } from "./commands/Command";
import ChatMessageCreated from "./events/ChatMessageCreated";
import ChatMessageUpdated from "./events/ChatMessageUpdated";
import { ContentFilterUtil } from "./functions/content-filter";
import { MessageUtil } from "./functions/message";
import { ServerUtil } from "./functions/server";
import { MuteScheduler } from "./jobs/MuteScheduler";
import type { Context } from "./typings";

export default class Client {
    userId: string | null = null;
    ownerId: string | null = null;
    operators: string[] = [];
    readonly ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
    readonly rest = new REST({ token: process.env.GUILDED_TOKEN });
    readonly prisma = new PrismaClient();
    readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    readonly timeouts = new Collection<string, NodeJS.Timeout>();
    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);
    readonly commands = new Collection<string, Command>();
    readonly messageUtil = new MessageUtil(this);
    readonly serverUtil = new ServerUtil(this);
    readonly contentFilterUtil = new ContentFilterUtil(this);

    readonly eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
        ChatMessageCreated,
        ChatMessageUpdated,
    };

    init() {
        new MuteScheduler(this, 15 * 60).init();
        return this.ws.connect();
    }
}
