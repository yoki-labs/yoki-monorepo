import type { WSTeamMemberUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (event: WSTeamMemberUpdatedPayload, ctx: Context, server: Server) => {
    const {
        userInfo: { id: userId, nickname },
        serverId,
    } = event.d;

    // Change member cache
    const cachedMember = await ctx.serverUtil.getCachedMember(serverId, userId);

    if (cachedMember) await ctx.serverUtil.setMember(serverId, userId, { ...cachedMember, nickname });

    // if the member's nickname is updated, scan it for any harmful content
    if (nickname) {
        if (["!", "."].some((x) => nickname.trim().startsWith(x)))
            return ctx.rest.router.updateMemberNickname(event.d.serverId, event.d.userInfo.id, nickname.slice(1).trim() || "NON-HOISTING NAME");
        return ctx.contentFilterUtil.scanContent({
            userId,
            text: nickname,
            filteredContent: FilteredContent.ServerContent,
            channelId: null,
            server,
            resultingAction: () => ctx.rest.router.deleteMemberNickname(serverId, userId),
        });
    }
};
