import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { CachedMember, Context } from "../typings";
import { isHashId } from "../utils/util";

export default async (input: string, _, __, ctx: Context, packet: WSChatMessageCreatedPayload): Promise<CachedMember | null> => {
    const userIdOrMention = packet.d.message.mentions?.users?.[0]?.id ?? input;
    if (!isHashId(userIdOrMention)) return null;
    const member = await ctx.serverUtil.getMember(packet.d.serverId, userIdOrMention).catch(() => null);
    return member ?? null;
};
