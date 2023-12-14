import { LogChannelType } from "@prisma/client";
import { inlineCode, summarizeItems } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import type { GEvent } from "../../typings";

export default {
    execute: async ([event, oldMembers, ctx]): Promise<void> => {
        const { serverId, members: newMembers } = event;

        // check if there's a log channel channel for message deletions
        const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_roles_updates);
        if (roleUpdateLogChannel) {
            // Prevent showcasing too many
            const cappedRoleChanges = newMembers.slice(0, 4);

            const roleDifferences = cappedRoleChanges.map((member) => {
                const { roleIds, userId } = member;

                const previousState = oldMembers.find((x) => x.id === member.userId);

                if (!previousState) return { userId, roleIds };

                // Array difference
                const addedRoles = roleIds.filter((currentRole) => !previousState.roleIds.includes(currentRole));
                const removedRoles = previousState.roleIds.filter((previousRole) => !roleIds.includes(previousRole));

                return { addedRoles, removedRoles, roleIds, userId };
            });

            const modifiedUsers = summarizeItems(newMembers, (x) => `<@${x.userId}>`, 10);

            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: roleUpdateLogChannel.channelId,
                title: `Member roles changed`,
                serverId,
                description: `${modifiedUsers} had their roles changed.`,
                color: Colors.blockBackground,
                // occurred: new Date().toISOString(),
                fields: roleDifferences.map((obj) => {
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
                }),
            });
        }
    },
    name: "rolesUpdated",
} satisfies GEvent<"rolesUpdated">;
