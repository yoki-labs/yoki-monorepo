import type { BaseCommand, CommandContext as BaseCommandContext, GEvent as AbstractGEvent } from "@yokilabs/bot";
import type { ClientEvents } from "guilded.js";

import type { TestClient } from "./Client";
import { RoleType } from "./util/fakes";

export type CommandContext = BaseCommandContext<Server>;

export type Command = BaseCommand<Command, TestClient, RoleType, Server>;

export type Server = { prefix: string | null };

export type GEvent<T extends keyof ClientEvents> = AbstractGEvent<TestClient, T>;
