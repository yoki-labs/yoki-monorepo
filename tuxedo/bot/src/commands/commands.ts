import type { BaseCommand } from "@yokilabs/bot";

import type { TuxedoClient } from "../Client";
import type { RoleType, Server } from "../typings";

export type Command = BaseCommand<Command, TuxedoClient, RoleType, Server>;

export enum Category {
    Events = "Events",
    Settings = "Settings",
    Economy = "Economy",
}
