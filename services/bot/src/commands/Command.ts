import type Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { CommandContext, Context, RoleType } from "../typings";

export interface Command {
    name: string;
    subName?: string;
    hidden?: boolean;
    description: string;
    usage: string;
    examples?: string[];
    aliases?: string[];
    parentCommand?: boolean;
    subCommand?: boolean;
    subCommands?: Collection<string, Command>;
    clientPermissions?: string[];
    userPermissions?: string[];
    args?: { name: string; type: "string" | "UUID" | "number" | "boolean" | "rest" | "listRest"; optional?: boolean; separator?: string; resolver?: (...content: any[]) => any }[];
    preRunCheck?: (message: ChatMessagePayload, args: string[], ctx: Context) => unknown;
    requiredRole?: RoleType;
    ownerOnly?: boolean;
    execute: (message: ChatMessagePayload, args: Record<string, string[] | string | number | boolean | null>, ctx: Context, raw: CommandContext) => unknown;
}
