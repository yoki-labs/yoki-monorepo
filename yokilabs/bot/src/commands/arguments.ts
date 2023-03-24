import type { ServerChannelPayload, TeamMemberPayload } from "@guildedjs/guilded-api-typings";

export type ResolvedArgs = string | string[] | number | boolean | TeamMemberPayload | ServerChannelPayload | null;
export interface UsedMentions {
    user: number;
    role: number;
    channel: number;
}
