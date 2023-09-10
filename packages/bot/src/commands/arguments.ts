import { ReactionInfo } from "@yokilabs/utils";
import type { Channel, Member } from "guilded.js";

// member cached in mem
export type CachedMember = Member;

// channel cached in mem
export type CachedChannel = Channel;

export interface ResolvedEnum {
    original: string;
    resolved: string | number;
}
export type ResolvedArgs = string | string[] | number | boolean | ResolvedEnum | CachedMember | Channel | ReactionInfo | null;
export interface UsedMentions {
    user: number;
    role: number;
    channel: number;
}
