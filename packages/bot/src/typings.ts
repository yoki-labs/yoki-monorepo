import type { ClientEvents, Member, Message } from "guilded.js";

import type { AbstractClient } from "./Client";
import type { IServer } from "./db-types";

// context available in every execution of a command
export interface CommandContext<T extends IServer> {
    message: Message;
    prefix: string;
    server: T;
    member: Member;
}

export interface GEvent<TClient extends AbstractClient<TClient, any, any>, T extends keyof ClientEvents> {
    execute: (args: [...Parameters<ClientEvents[T]>, TClient]) => unknown;
    name: T;
}
