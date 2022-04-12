import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type { ContentFilter, Server } from "@prisma/client";

import type Client from "./Client";

export type Context = Client;

export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
    server: Server;
}

export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Server, Severity } from "@prisma/client";
export type ContentFilterScan = Pick<ContentFilter, "content" | "infractionPoints" | "severity">;
