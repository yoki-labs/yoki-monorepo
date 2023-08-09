import type { Collection } from "@discordjs/collection";
import type { Message } from "guilded.js";

import type { AbstractClient } from "../Client";
import type { IServer } from "../db-types";
import type { CommandContext } from "../typings";
import type { ResolvedArgs, UsedMentions } from "./arguments";

export interface BaseCommand<
    TCommand extends BaseCommand<TCommand, TClient, TRoleType, TServer>,
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TRoleType extends string,
    TServer extends IServer
> {
    name: string;
    subName?: string;
    hidden?: boolean;
    forceShow?: boolean;
    description: string;
    // usage?: string;
    category?: string;
    examples?: string[];
    aliases?: string[];
    module?: string;
    parentCommand?: boolean;
    subCommand?: boolean;
    subCommands?: Collection<string, TCommand>;
    clientPermissions?: string[];
    userPermissions?: string[];
    args?: CommandArgument[];
    preRunCheck?: (message: Message, args: string[], ctx: TClient) => unknown;
    requiredRole?: TRoleType;
    rawArgs?: boolean;
    devOnly?: boolean;
    execute: (message: Message, args: Record<string, ResolvedArgs>, ctx: TClient, raw: CommandContext<TServer>) => unknown;
}

export interface CommandArgument {
    // In-code basics
    name: string;
    type: CommandArgType;
    optional?: boolean;

    // Display
    display?: string;

    // Type-based
    separator?: string;
    max?: number;
    min?: number;
    allowDecimal?: boolean;
    values?: any;
    resolver?: (...content: any[]) => any;
}
export type CommandArgType = "string" | "UUID" | "member" | "number" | "boolean" | "enum" | "time" | "rest" | "enumList" | "channel" | "emote" | "role";
export type CommandArgValidator = [
    (input: string, rawArgs: string[], index: number, message: Message, argument: CommandArgument, usedMentions: UsedMentions) => ResolvedArgs | Promise<ResolvedArgs>,
    (arg: CommandArgument) => string
];
