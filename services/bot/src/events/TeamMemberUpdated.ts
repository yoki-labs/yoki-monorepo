import type { WSTeamMemberUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (event: WSTeamMemberUpdatedPayload, ctx: Context, server: Server) => {
    const {
        userInfo: { id: userId, nickname },
        serverId,
    } = event.d;

    // if the member's nickname is updated, scan it for any harmful content
    if (nickname) {
        if (["!", "."].some((x) => nickname.includes(x)))
            return ctx.rest.router.updateMemberNickname(event.d.serverId, event.d.userInfo.id, nickname.slice(1).trim() || "NON-HOISTING NAME");
        return ctx.contentFilterUtil.scanContent(userId, nickname, FilteredContent.ServerContent, null, server, () => ctx.rest.router.deleteMemberNickname(serverId, userId));
    }
};
