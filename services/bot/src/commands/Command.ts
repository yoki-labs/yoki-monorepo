import type Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { CommandContext, Context, RoleType } from "../typings";

export interface Command {
    name: string;
    subName?: string;
    hidden?: boolean;
    description: string;
    usage?: string;
    category?: string;
    examples?: string[];
    aliases?: string[];
    parentCommand?: boolean;
    subCommand?: boolean;
    subCommands?: Collection<string, Command>;
    clientPermissions?: string[];
    userPermissions?: string[];
    args?: CommandArgument[];
    preRunCheck?: (message: ChatMessagePayload, args: string[], ctx: Context) => unknown;
    requiredRole?: RoleType;
    ownerOnly?: boolean;
    execute: (message: ChatMessagePayload, args: Record<string, string[] | string | number | boolean | null>, ctx: Context, raw: CommandContext) => unknown;
}

export interface CommandArgument {
    name: string;
    type: CommandArgumentType;
    optional?: boolean;
    separator?: string;
    resolver?: (...content: any[]) => any;
}
export type CommandArgumentType = "string" | "UUID" | "hashId" | "number" | "boolean" | "rest" | "listRest";

export interface CommandArgumentDefinition {
    friendlyName: string;
    isCorrect(args: string[], index: number, preTransformed: any): boolean;
    transform?(args: string[], index: number, preTransformed: any, commandArg: CommandArgument): any;
    // To not do same thing twice
    preTransform?(args: string[], index: number): any;
}
