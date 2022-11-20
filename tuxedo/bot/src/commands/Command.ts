import type { Server } from "@prisma/client";

import type { BaseCommand } from "../../../../yoki-labs/bot/commands/command-typings";
import type Client from "../Client";
import type { RoleType } from "../typings";

export type Command = BaseCommand<Command, Client, RoleType, Server>;
