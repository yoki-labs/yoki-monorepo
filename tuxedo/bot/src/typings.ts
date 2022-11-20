import type { BaseCommand } from "../../../yoki-labs/bot/commands/command-typings";
import type { CommandContext as BaseCommandContext } from "../../../yoki-labs/bot/typings";
import type Client from "./Client";

export type CommandContext = BaseCommandContext<any>;

export type Command = BaseCommand<Command, Client, RoleType, any>;

export type RoleType = "MOD";

export type Context = Client;
