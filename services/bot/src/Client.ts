import Collection from "@discordjs/collection";
import REST from "@guildedjs/rest";
import WebSocketManager from "@guildedjs/ws";
import { PrismaClient } from "@prisma/client";

import type { Command } from "./commands/Command";
import ChatMessageCreated from "./events/ChatMessageCreated";
import { ContentFilterUtil } from "./functions/content-filter";
import { MessageUtil } from "./functions/message";
import { ServerUtil } from "./functions/server";
import type { Context } from "./typings";

export default class Client {
    ws = new WebSocketManager({ token: process.env.GUILDED_TOKEN });
    rest = new REST({ token: process.env.GUILDED_TOKEN });
    commands = new Collection<string, Command>();
    prisma = new PrismaClient();

    messageUtil = new MessageUtil(this);
    serverUtil = new ServerUtil(this);
    contentFilterUtil = new ContentFilterUtil(this);

    eventHandler: { [x: string]: (packet: any, ctx: Context) => void } = {
        ChatMessageCreated,
    };
}
