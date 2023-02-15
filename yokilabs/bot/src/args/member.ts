import type { TeamMemberPayload, WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";

import { isHashId } from "@yokilabs/util";
import type AbstractClient from "../Client";
import type { UsedMentions } from "../commands/arguments";

export default async <TClient extends AbstractClient<TClient, any, any>>(
    input: string,
    args: string[],
    index: number,
    ctx: TClient,
    packet: WSChatMessageCreatedPayload,
    ___: any,
    usedMentions: UsedMentions
): Promise<TeamMemberPayload | null> => {
    if (input.startsWith("@")) {
        // Get the mentioned user and increment used mentions
        const mention = packet.d.message.mentions?.users?.[usedMentions.user++];
        if (!mention) return null;

        const member = await ctx.serverUtil.getMember(packet.d.serverId, mention.id).catch(() => null);
        if (!member) return null;

        const name = member.nickname ?? member.user.name;
        const spaceCount = name.split(" ").length;

        // If we have `@nico's alt`, remove ` alt` part and modify `@nico's` to be `@nico's alt`
        args.splice(index + 1, spaceCount - 1);

        args[index] = name;

        return member;
    } else if (isHashId(input)) {
        return ctx.serverUtil.getMember(packet.d.serverId, input).catch(() => null) ?? null;
    }

    return null;
};
