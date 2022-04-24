import type { WSTeamMemberUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../functions/content-filter";
import type { Context } from "../typings";

export default async (event: WSTeamMemberUpdatedPayload, ctx: Context) => {
    const {
        userInfo: { id: userId, nickname },
        serverId,
    } = event.d;

    // get server from database
    const serverFromDb = await ctx.serverUtil.getServer(serverId);
    // check if server is in early access
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    // if the member's nickname is updated, scan it for any harmful content
    if (nickname)
        return ctx.contentFilterUtil.scanContent(userId, nickname, FilteredContent.ServerContent, null, serverFromDb, () => ctx.rest.router.deleteMemberNickname(serverId, userId));
};
