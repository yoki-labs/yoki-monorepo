import { PrismaClient } from "@prisma/client";
import { AbstractClient, MessageUtil, RoleUtil } from "@yokilabs/bot";

import { DatabaseUtil } from "./helpers/database";
import type { Command, Server } from "./typings";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export default class TuxedoClient extends AbstractClient<TuxedoClient, Server, Command> {
    // database connection
    readonly prisma = new PrismaClient();

    // Util
    readonly roleUtil: RoleUtil<TuxedoClient> = new RoleUtil<TuxedoClient>(this);
    readonly messageUtil: MessageUtil<TuxedoClient, Server, Command> = new MessageUtil<TuxedoClient, Server, Command>(this);
    readonly dbUtil: DatabaseUtil = new DatabaseUtil(this);

    // events that this bot handles, directly from the ws manager
    readonly eventHandler: { [x: string]: (packet: any, ctx: TuxedoClient, server: Server) => Promise<unknown> } = {
    };
}
