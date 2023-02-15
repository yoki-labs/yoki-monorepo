import { PrismaClient } from "@prisma/client";
import { AbstractClient, MessageUtil, ServerUtil } from "@yokilabs/bot";

import ChatMessageCreated from "./events/ChatMessageCreated";
import { DatabaseUtil } from "./helpers/database";
import type { Command, Server } from "./typings";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class Client extends AbstractClient<Client, Server, Command> {
    // database connection
    readonly prisma = new PrismaClient();

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
