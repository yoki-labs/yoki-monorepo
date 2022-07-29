import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import type { Context } from "../typings";
import { isUUID } from "../utils/util";

export default async (input: string, _, __, ctx: Context, packet: WSChatMessageCreatedPayload) => {
    const channelMentionOrId = packet.d.message.mentions?.channels?.[0]?.id ?? input;
    const isValidUUID = isUUID(channelMentionOrId);
    if (!isValidUUID) return null;
    const getChannel = await ctx.rest.router.getChannel(channelMentionOrId).catch(() => null);
    return getChannel?.channel ?? null;
};
