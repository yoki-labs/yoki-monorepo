import type { Server } from "@prisma/client";
import type { BaseCommand } from "@yokilabs/bot";

import type Client from "../Client";
import type { RoleType } from "../typings";

export type Command = BaseCommand<Command, Client, RoleType, Server>;
