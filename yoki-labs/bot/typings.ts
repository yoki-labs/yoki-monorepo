import type { ServerChannelPayload, TeamMemberPayload, WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { IServer } from "./db-types";

export type AbstractContext<T> = T;

// context available in every execution of a command
export interface CommandContext<T extends IServer> {
    packet: WSChatMessageCreatedPayload;
    server: T;
    member: TeamMemberPayload;
}

// Channel cached in redis
export type CachedChannel = Pick<ServerChannelPayload, "id" | "type" | "name" | "createdAt" | "serverId" | "parentId" | "categoryId" | "groupId">;
