import type { ServerChannelPayload, TeamMemberPayload, WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type { ContentFilter, FilterMatching, Server as DBServer } from "@prisma/client";

import type Client from "./Client";

export type Context = Client;

// context available in every execution of a command
export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
    server: Server;
    member: CachedMember;
}

// member cached in redis
export type CachedMember = TeamMemberPayload;

// channel cached in redis
export type CachedChannel = Pick<ServerChannelPayload, "id" | "type" | "name" | "createdAt" | "serverId" | "parentId" | "categoryId" | "groupId">;

// re-exporting enums, types, etc. from prisma incase we switch ORMs so we can easily replace them
export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Severity } from "@prisma/client";

// presets object
export type ContentFilterScan = Pick<ContentFilter, "content" | "matching" | "infractionPoints" | "severity">;
export type Server = DBServer & { getPrefix: () => string; getTimezone: () => string; formatTimezone: (date: Date) => string };
export type ResolvedArgs = string | string[] | number | boolean | CachedMember | ServerChannelPayload | null;
export interface UsedMentions {
    user: number;
    role: number;
    channel: number;
}

export declare interface PresetPatternObject {
    type: FilterMatching;
    _: PresetPattern[];
}
export type PresetPattern = string | string[] | PresetPatternObject;

export declare interface PresetLink {
    domain: string;
    subdomain?: string;
    route?: string[];
}
