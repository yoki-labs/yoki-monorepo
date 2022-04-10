import type Collection from "@discordjs/collection";
import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type RestManager from "@guildedjs/rest";
import type { PrismaClient } from "@prisma/client";

import type { Command } from "./commands/Command";
import type { ContentFilterUtil } from "./functions/content-filter";
import type { MessageUtil } from "./functions/message";
import type { ServerUtil } from "./functions/server";

export interface Context {
    rest: RestManager;
    commands: Collection<string, Command>;
    prisma: PrismaClient;
    messageUtil: MessageUtil;
    serverUtil: ServerUtil;
    contentFilterUtil: ContentFilterUtil;
}

export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
}

export { LogChannelType, RoleType, Severity } from "@prisma/client";
