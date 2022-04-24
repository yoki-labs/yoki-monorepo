import type { WSTeamRolesUpdatedPayload } from "@guildedjs/guilded-api-typings";

import { buildMemberKey } from "../functions/server";
import type { Context } from "../typings";

export default async (event: WSTeamRolesUpdatedPayload, ctx: Context): Promise<void> => {
    const server = await ctx.prisma.server.findFirst({ where: { serverId: event.d.serverId } });
    if (!server) return void 0;
    for (const user of event.d.memberRoleIds) {
        const ifCached = await ctx.serverUtil.cache.get(buildMemberKey(server.serverId, user.userId));
        if (!ifCached) continue;
        await ctx.serverUtil.setMember(server.serverId, user.userId, { ...ifCached, roleIds: user.roleIds });
        console.log(`Updating cache for user ${ifCached.user.name} (${ifCached.user.id}) with new roles ${user.roleIds}`);
    }
};
