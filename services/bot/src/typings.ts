import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type { ContentFilter, FilterMatching, Server as DBServer } from "@prisma/client";

import type Client from "./Client";

export type Context = Client;

// context available in every execution of a command
export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
    server: Server;
    member: CachedMember;
    language: LanguageDictionary;
}

// member cached in redis
export interface CachedMember {
    roleIds: number[];
    user: { id: string; name: string };
    isOwner?: boolean;
}

// re-exporting enums, types, etc. from prisma incase we switch ORMs so we can easily replace them
export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Severity } from "@prisma/client";

// presets object
export type ContentFilterScan = Pick<ContentFilter, "content" | "matching" | "infractionPoints" | "severity">;
export type Server = DBServer & { getPrefix: () => string };
export type ResolvedArgs = string | string[] | number | boolean | CachedMember | null | undefined;

export type PresetFile = Record<FilterMatching, string[]>;
export declare interface LanguageDictionary {
    name: string;
    terms: Record<string, string>;
    getTerm(name: string, ...args: any[]): string;
}
