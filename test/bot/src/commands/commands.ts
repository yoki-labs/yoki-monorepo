import { RoleType } from "@prisma/client";
import type { BaseCommand } from "@yokilabs/bot";

import type { TestClient } from "../Client";
import type { Server } from "../typings";

export type Command = BaseCommand<Command, TestClient, RoleType, Server>;

export enum Category {
    Settings = "Settings",
}
