import type { WSTeamRolesUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type { Context } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";

export default async (event: WSTeamRolesUpdatedPayload, ctx: Context): Promise<void> => {
    const { serverId, memberRoleIds } = event.d;

    // Prevent repeation of `getCachedMember`
    const memberCaches = {};

    for (const memberRoleId of memberRoleIds) memberCaches[memberRoleId.userId] = await ctx.serverUtil.getCachedMember(serverId, memberRoleId.userId);

    // check if there's a log channel channel for message deletions
    const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_roles_updates);
    if (roleUpdateLogChannel) {
        // Prevent showcasing too many
        const cappedRoleChanges = memberRoleIds.slice(0, 5);

        const roleDifferences = cappedRoleChanges.map(({ userId, roleIds }) => {
            const previousState = memberCaches[userId];

            if (!previousState) return { userId, roleIds };

            // Array difference
            const addedRoles = roleIds.filter((currentRole) => !previousState.roleIds.includes(currentRole));
            const removedRoles = previousState.roleIds.filter((previousRole) => !roleIds.includes(previousRole));

            return { addedRoles, removedRoles, roleIds, userId };
        });

        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog(
            roleUpdateLogChannel.channelId,
            `Member's roles changed`,
            stripIndents`
                    **Modified user count:** ${memberRoleIds.length}
                    **Modified users:** ${memberRoleIds
                        .slice(0, 20)
                        .map((x) => `<@${x.userId}>`)
                        .join(", ")}${memberRoleIds.length > 20 ? "..." : ""}
                `,
            Colors.blue,
            new Date().toISOString(),
            roleDifferences.map((obj) => {
                const { userId, addedRoles, removedRoles, roleIds } = obj;

                return {
                    name: `<@${userId}> (${inlineCode(userId)})`,
                    value:
                        addedRoles || removedRoles
                            ? stripIndents`
                                    ${addedRoles?.length ? `**Added:** ${addedRoles.map((role) => `<@${role}>`).join(", ")}` : ""}
                                    ${removedRoles?.length ? `**Removed:** ${removedRoles.map((role) => `<@${role}>`).join(", ")}` : ""}
                                  `
                            : `Unknown role difference. Current roles: ${roleIds.map((role) => `<@${role}>`).join(", ")}`,
                };
            })
        );
    }

    // go through all the updated members
    for (const user of memberRoleIds) {
        // check if this member is cached in our redis, indicates that they have some sort of elevated permission role
        const cachedMember = memberCaches[user.userId];

        if (cachedMember) {
            // update the cache with the old data but with updated roleIds
            await ctx.serverUtil.setMember(serverId, user.userId, { ...cachedMember, roleIds: user.roleIds });
            console.log(`Updating cache for user ${cachedMember.user.name} (${cachedMember.user.id}) with new roles ${user.roleIds}`);
        } else await ctx.serverUtil.getMember(serverId, user.userId, true, true);
    }
};
