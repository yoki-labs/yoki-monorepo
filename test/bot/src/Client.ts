import { AbstractClient, RoleUtil } from "@yokilabs/bot";

import type { Command, Server } from "./typings";
import DerivedMessageUtil from "./helpers/messages";

/**
 * Main class that stores utils, connections to various providers, and ws
 */
export class TestClient extends AbstractClient<TestClient, Server, Command> {
    // Util
    readonly roleUtil: RoleUtil<TestClient> = new RoleUtil<TestClient>(this);

    readonly messageUtil: DerivedMessageUtil = new DerivedMessageUtil(this);

    // events that this bot handles, directly from the ws manager
    readonly eventHandler: { [x: string]: (packet: any, ctx: TestClient, server: Server) => Promise<unknown> } = {};

    readonly mainServerDevRoleId: number = parseInt(process.env.MAIN_SERVER_DEV_ROLE_ID!, 10);
}
