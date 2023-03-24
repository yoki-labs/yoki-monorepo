import type { BaseCommand } from "@yokilabs/bot";

import type Client from "../Client";
import type { RoleType, Server } from "../typings";

export type Command = BaseCommand<Command, Client, RoleType, Server>;
