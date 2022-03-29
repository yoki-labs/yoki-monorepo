import Collection from "@discordjs/collection";
import type { ChatMessagePayload } from "@guildedjs/guilded-api-typings";

import type { CommandContext, Context } from "../typings";

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    parentCommand?: boolean;
    subCommand?: boolean;
    subCommands: Collection<string, Command>;
    clientPermissions?: string[];
    userPermissions?: string[];
    args?: { name: string; type: string; resolver?: (...content: any[]) => any }[];
    preRunCheck: (message: ChatMessagePayload, args: string[], ctx: Context) => unknown;
    execute: (message: ChatMessagePayload, args: { [x: string]: string | number | boolean }, commandCtx: CommandContext, ctx: Context) => unknown;
}
