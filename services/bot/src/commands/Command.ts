import type Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { CommandContext, Context, ResolvedArgs, RoleType } from "../typings";

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
    devOnly?: boolean;
    execute: (message: ChatMessagePayload, args: Record<string, ResolvedArgs>, ctx: Context, raw: CommandContext) => unknown;
}

export interface CommandArgument {
    name: string;
    type: CommandArgType;
    optional?: boolean;
    separator?: string;
    max?: number;
    values?: any;
    resolver?: (...content: any[]) => any;
}
export type CommandArgType = "string" | "UUID" | "member" | "number" | "boolean" | "enum" | "rest" | "enumList";
