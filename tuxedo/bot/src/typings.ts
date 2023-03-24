import type { Server as DBServer } from "@prisma/client";
import type { BaseCommand, CommandContext as BaseCommandContext } from "@yokilabs/bot";

import type Client from "./Client";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, Client, RoleType, Server>;

export type RoleType = "MOD";

export type Server = DBServer & { getPrefix: () => string };
