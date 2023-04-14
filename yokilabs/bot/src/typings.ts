import type { ClientEvents, Message } from "guilded.js";
import type AbstractClient from "./Client";
import type { CachedMember } from "./commands/arguments";

import type { IServer } from "./db-types";

// context available in every execution of a command
export interface CommandContext<T extends IServer> {
    message: Message;
    server: T;
    member: CachedMember;
}

export interface GEvent<TClient extends AbstractClient<TClient, any, any>, T extends keyof ClientEvents> {
    execute: (args: [...Parameters<ClientEvents[T]>, TClient]) => unknown;
    name: T;
}
