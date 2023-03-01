import type { ContentFilter, FilterMatching, Server as DBServer } from "@prisma/client";
import type { Channel, ClientEvents, Member, Message } from "guilded.js";

import type YokiClient from "./Client";

export type Context = YokiClient;

// context available in every execution of a command
export interface CommandContext {
	message: Message;
	server: Server;
	member: CachedMember;
}

// member cached in mem
export type CachedMember = Member;

// channel cached in mem
export type CachedChannel = Channel;

// re-exporting enums, types, etc. from prisma incase we switch ORMs so we can easily replace them
export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Severity } from "@prisma/client";

// presets object
export type ContentFilterScan = Pick<ContentFilter, "content" | "matching" | "infractionPoints" | "severity">;
export type Server = DBServer & { getPrefix: () => string; getTimezone: () => string; formatTimezone: (date: Date) => string };
export interface ResolvedEnum { original: string, resolved: string }
export type ResolvedArgs = string | string[] | number | boolean | ResolvedEnum | CachedMember | Channel | null;
export interface UsedMentions {
	user: number;
	role: number;
	channel: number;
}

export declare interface PresetPatternObject {
	type: FilterMatching;
	_: PresetPattern[];
}
export type PresetPattern = string | string[] | PresetPatternObject;

export declare interface PresetLink {
	domain: string;
	subdomain?: string;
	route?: string[];
}

export interface GEvent {
	execute: (...args: unknown[]) => unknown;
	name: keyof ClientEvents;
}
