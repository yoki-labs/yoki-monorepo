import type Collection from "@discordjs/collection";
import { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import type RestManager from "@guildedjs/rest";
import { PrismaClient } from "@prisma/client";

import type { Command } from "./commands/Command.spec";

export interface Context {
    rest: RestManager;
    commands: Collection<string, Command>;
    prisma: PrismaClient;
}

export interface CommandContext {
    packet: WSChatMessageCreatedPayload;
}
