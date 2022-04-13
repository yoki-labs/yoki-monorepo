import Collection from "@discordjs/collection";
import REST from "@guildedjs/rest";
import { WebhookClient } from "@guildedjs/webhook-client";
import WebSocketManager from "@guildedjs/ws";
import { PrismaClient } from "@prisma/client";
import RedisClient, { RedisOptions } from "ioredis";

import type { Command } from "./commands/Command";
import ChatMessageCreated from "./events/ChatMessageCreated";
import { ContentFilterUtil } from "./functions/content-filter";
import { MessageUtil } from "./functions/message";
import { ServerUtil } from "./functions/server";
import type { Context } from "./typings";

export default class Client {
    userId: string | null = null;
    ownerId: string | null = null;
    operators: string[] = [];
    readonly ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
    readonly rest = new REST({ token: process.env.GUILDED_TOKEN });
    readonly prisma = new PrismaClient();
    readonly redis = new RedisClient({
        host: process.env.REDIS_HOST ?? "cache",
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        port: process.env.REDIS_PORT ?? 6379,
    } as RedisOptions);

    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);

    readonly commands = new Collection<string, Command>();
    readonly messageUtil = new MessageUtil(this);
    readonly serverUtil = new ServerUtil(this);
    readonly contentFilterUtil = new ContentFilterUtil(this);

    eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
        ChatMessageCreated,
    };
}
