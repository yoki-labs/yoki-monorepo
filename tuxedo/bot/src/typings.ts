import type { Server as DBServer, RoleType } from "@prisma/client";
import type { BaseCommand, CommandContext as BaseCommandContext, GEvent as AbstractGEvent } from "@yokilabs/bot";
import type { ClientEvents } from "guilded.js";

import type { TuxoClient } from "./Client";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, TuxoClient, RoleType, Server>;

export type Server = DBServer;

export type GEvent<T extends keyof ClientEvents> = AbstractGEvent<TuxoClient, T>;
