import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type { ContentFilter, Server as DBServer } from "@prisma/client";

import type Client from "./Client";

export type Context = Client;

// context available in every execution of a command
export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
    server: Server;
    member: CachedMember;
}

// member cached in redis
export interface CachedMember {
    roleIds: number[];
    user: { id: string; name: string };
}

// re-exporting enums, types, etc. from prisma incase we switch ORMs so we can easily replace them
export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Severity } from "@prisma/client";

// presets object
export type ContentFilterScan = Pick<ContentFilter, "content" | "infractionPoints" | "severity">;
export type Server = DBServer & { getPrefix: () => string };
export type ResolvedArgs = string | string[] | number | boolean | null;
