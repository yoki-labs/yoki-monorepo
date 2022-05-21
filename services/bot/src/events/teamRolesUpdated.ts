import type { WSTeamRolesUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { buildMemberKey } from "../functions/server";
import type { Context } from "../typings";

export default async (event: WSTeamRolesUpdatedPayload, ctx: Context): Promise<void> => {
    const { serverId, memberRoleIds } = event.d;

    // go through all the updated members
    for (const user of memberRoleIds) {
        // check if this member is cached in our redis, indicates that they have some sort of elevated permission role
        const ifCached = await ctx.serverUtil.cache.get(buildMemberKey(serverId, user.userId));
        // if they're not cached, continue on to the next member
        if (!ifCached) continue;
        // update the cache with the old data but with updated roleIds
        await ctx.serverUtil.setMember(serverId, user.userId, { ...ifCached, roleIds: user.roleIds });
        console.log(`Updating cache for user ${ifCached.user.name} (${ifCached.user.id}) with new roles ${user.roleIds}`);
    }
};
