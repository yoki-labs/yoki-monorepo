import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { CachedMember, Context } from "../typings";
import { isHashId } from "../util";

export default async (input: string, _, __, ctx: Context, packet: WSChatMessageCreatedPayload): Promise<CachedMember | null> => {
    if (!isHashId(input)) return null;
    const member = await ctx.serverUtil.getMember(packet.d.serverId, input).catch(() => null);
    return member ?? null;
};
