import type { RoleType } from "@prisma/client";
import type { BaseCommand, CommandContext as BaseCommandContext } from "@yokilabs/bot";

import type YokiClient from "../Client";
import type { Server } from "../typings";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, YokiClient, RoleType, Server>;

export enum Category {
    Settings = "Settings",
    Moderation = "Moderation",
    Modmail = "Modmail",
    Tags = "Tags",
    Filter = "Filter",
    Logs = "Logging",
    Antiraid = "Antiraid",
    Appeal = "Appeals",
    Scan = "Scanning"
}
