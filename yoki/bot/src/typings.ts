import type { ContentFilter, FilterMatching, Server as DBServer } from "@prisma/client";
import type { GEvent as AbstractGEvent } from "@yokilabs/bot";
import type { Channel, ClientEvents, Member } from "guilded.js";

import type YokiClient from "./Client";

export type Context = YokiClient;

// context available in every execution of a command
export type Server = DBServer & { getPrefix: () => string; getTimezone: () => string; formatTimezone: (date: Date) => string };

export type GEvent<T extends keyof ClientEvents> = AbstractGEvent<YokiClient, T>;

// cached in mem
export type CachedMember = Member;
export type CachedChannel = Channel;

// re-exporting enums, types, etc. from prisma incase we switch ORMs so we can easily replace them
export { Action, ContentFilter, LogChannel, LogChannelType, RoleType, Severity } from "@prisma/client";

// presets object
export type ContentFilterScan = Pick<ContentFilter, "content" | "matching" | "infractionPoints" | "severity">;
export interface ResolvedEnum {
    original: string;
    resolved: string;
}
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
