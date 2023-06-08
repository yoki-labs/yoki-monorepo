import { RoleType } from "@prisma/client";
import type { BaseCommand } from "@yokilabs/bot";

import type { TuxoClient } from "../Client";
import type { Server } from "../typings";

export type Command = BaseCommand<Command, TuxoClient, RoleType, Server>;

export enum Category {
    Custom = "Customization",
    Settings = "Settings",
    Economy = "Economy",
    Events = "Events",
    Income = "Income",
}
