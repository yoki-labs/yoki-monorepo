import type Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { CommandContext, Context } from "../typings";

export interface Command {
    name: string;
    subName?: string;
    description: string;
    usage: string;
    examples?: string[];
    aliases?: string[];
    parentCommand?: boolean;
    subCommand?: boolean;
    subCommands?: Collection<string, Command>;
    clientPermissions?: string[];
    userPermissions?: string[];
    args?: { name: string; type: "string" | "number" | "boolean"; optional?: boolean; resolver?: (...content: any[]) => any }[];
    preRunCheck?: (message: ChatMessagePayload, args: string[], ctx: Context) => unknown;
    modOnly?: boolean;
    ownerOnly?: boolean;
    execute: (message: ChatMessagePayload, args: { [x: string]: string | number | boolean }, ctx: Context, raw: CommandContext) => unknown;
}
