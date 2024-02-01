import { ReactionInfo } from "@yokilabs/utils";
import type { Channel, Member, User } from "guilded.js";

export interface ResolvedEnum {
    original: string;
    resolved: string | number;
}
export type ResolvedArgs = string | string[] | number | boolean | ResolvedEnum | Member | User | Channel | ReactionInfo | null;

export interface UsedMentions {
    user: number;
    role: number;
    channel: number;
}
