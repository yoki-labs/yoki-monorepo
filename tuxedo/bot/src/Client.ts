import { PrismaClient } from "@prisma/client";
import { AbstractClient, MessageUtil, RoleUtil } from "@yokilabs/bot";

import { BalanceUtil } from "./helpers/balance";
import { DatabaseUtil } from "./helpers/database";
import { GiveawayUtil } from "./helpers/giveaway";
import type { Command, Server } from "./typings";
import { MinigameUtil } from "./helpers/minigame";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export class TuxoClient extends AbstractClient<TuxoClient, Server, Command> {
    // database connection
    readonly prisma = new PrismaClient();

    // Util
    readonly roleUtil: RoleUtil<TuxoClient> = new RoleUtil<TuxoClient>(this);

    readonly messageUtil: MessageUtil<TuxoClient, Server, Command> = new MessageUtil<TuxoClient, Server, Command>(this);

    readonly dbUtil: DatabaseUtil = new DatabaseUtil(this);

    readonly giveawayUtil: GiveawayUtil = new GiveawayUtil(this);
    
    readonly balanceUtil: BalanceUtil = new BalanceUtil(this);

    readonly minigameUtil: MinigameUtil = new MinigameUtil(this);

    // events that this bot handles, directly from the ws manager
    readonly eventHandler: { [x: string]: (packet: any, ctx: TuxoClient, server: Server) => Promise<unknown> } = {};
}
