import type { RoleType } from "@prisma/client";
import type { BaseCommand, CommandContext as BaseCommandContext } from "@yokilabs/bot";

import type YokiClient from "../Client";
import type { Server } from "../typings";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, YokiClient, RoleType, Server>;

export enum Category {
    Custom = "Customization",
    Settings = "Automod",
    Moderation = "Moderation",
    Info = "Information",
    Entry = "Server Entry",
    Modmail = "Modmail",
    Filter = "Filter",
    // Logs = "Logging",
    // Scan = "Scanning",
}
