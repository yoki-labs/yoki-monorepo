import type { BaseCommand, CommandContext as BaseCommandContext } from "@yokilabs/bot";

import type Client from "./Client";

export type CommandContext = BaseCommandContext<any>;

export type Command = BaseCommand<Command, Client, RoleType, any>;

export type RoleType = "MOD";

export type Context = Client;
