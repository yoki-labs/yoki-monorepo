import type { Server as DBServer } from "@prisma/client";
import type { BaseCommand, CommandContext as BaseCommandContext } from "@yokilabs/bot";
import type { GEvent as AbstractGEvent } from "@yokilabs/bot";
import type { ClientEvents } from "guilded.js";

import type TuxedoClient from "./Client";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, TuxedoClient, RoleType, Server>;

export type RoleType = "MOD";

export type Server = DBServer & { getPrefix: () => string };

export type GEvent<T extends keyof ClientEvents> = AbstractGEvent<TuxedoClient, T>;