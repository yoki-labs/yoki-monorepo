import type { ChatMessagePayload, SkeletonWSPayload } from "@guildedjs/guilded-api-typings";
import type { Context } from "typings";

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    clientPermissions?: string[];
    userPermissions?: string[];
    args: { name: string; type: string; resolver: (...content: any[]) => any }[];
    preRunCheck: (message: ChatMessagePayload, args: string[], ctx: Context) => unknown;
    execute: (message: ChatMessagePayload, args: string[], ctx: Context, packet: SkeletonWSPayload) => unknown;
}
