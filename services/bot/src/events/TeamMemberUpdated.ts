import type { WSTeamMemberUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../functions/content-filter";
import type { Context } from "../typings";

export default async (event: WSTeamMemberUpdatedPayload, ctx: Context) => {
    const {
        userInfo: { id: userId, nickname },
        serverId,
    } = event.d;

    const serverFromDb = await ctx.serverUtil.getServerFromDatabase(serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    // Filter only set nicknames/nickname may be null
    if (nickname)
        return ctx.contentFilterUtil.scanContent(userId, nickname, FilteredContent.ServerContent, null, serverFromDb, () => ctx.rest.router.deleteMemberNickname(serverId, userId));
};
