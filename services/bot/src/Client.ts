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
    readonly rest = new RestManager({ token: process.env.GUILDED_TOKEN });
    readonly prisma = new PrismaClient();
    readonly redis = new RedisClient(process.env.REDIS_URL ?? "cache:6379");

    readonly timeouts = new Collection<string, NodeJS.Timeout>();
    readonly intervals = new Collection<string, NodeJS.Timer>();
    readonly errorHandler = new WebhookClient(process.env.ERROR_WEBHOOK);
    readonly commands = new Collection<string, Command>();
    readonly messageUtil = new MessageUtil(this);
    readonly serverUtil = new ServerUtil(this);
    readonly contentFilterUtil = new ContentFilterUtil(this);

    readonly muteHandler = new MuteScheduler(this, 15 * 60);

    readonly eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
        ChatMessageCreated,
        ChatMessageUpdated,
        ChatMessageDeleted,
        TeamMemberUpdated,
    };

    init() {
        this.muteHandler.init();
        return this.ws.connect();
    }
}
