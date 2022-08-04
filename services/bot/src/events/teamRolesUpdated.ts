import type { WSTeamRolesUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";

export default async (event: WSTeamRolesUpdatedPayload, ctx: Context): Promise<void> => {
    const { serverId, memberRoleIds } = event.d;

    // check if there's a log channel channel for message deletions
    const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.MEMBER_ROLES_UPDATE);
    if (roleUpdateLogChannel) {
        // Prevent showcasing too many
        const cappedRoleChanges = memberRoleIds.slice(0, 5);

        const roleDifferences = await Promise.all(
            cappedRoleChanges.map(async ({ userId, roleIds }) => {
                const previousState = await ctx.serverUtil.getCachedMember(serverId, userId);

                if (!previousState) return { userId, roleIds };

                // Array difference
                const addedRoles = roleIds.filter((currentRole) => !previousState.roleIds.includes(currentRole));
                const removedRoles = previousState.roleIds.filter((previousRole) => !roleIds.includes(previousRole));

                return { addedRoles, removedRoles, roleIds, userId };
            })
        );

        try {
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
        } catch (e) {
            // generate ID for this error, not persisted in database
            const referenceId = nanoid();
            // send error to the error webhook
            if (e instanceof Error) {
                console.error(e);
                void ctx.errorHandler.send("Error in logging member roles updated event!", [
                    new WebhookEmbed()
                        .setDescription(
                            stripIndents`
                            Reference ID: ${inlineCode(referenceId)}
                            Server: ${inlineCode(serverId)}
                            Error: \`\`\`
                            ${e.stack ?? e.message}
                            \`\`\`
                        `
                        )
                        .setColor("RED"),
                ]);
            }
        }
    }

    // go through all the updated members
    for (const user of memberRoleIds) {
        // check if this member is cached in our redis, indicates that they have some sort of elevated permission role
        const ifCached = await ctx.serverUtil.getCachedMember(serverId, user.userId);
        // if they're not cached, continue on to the next member
        if (!ifCached) continue;
        // update the cache with the old data but with updated roleIds
        await ctx.serverUtil.setMember(serverId, user.userId, { ...ifCached, roleIds: user.roleIds });
        console.log(`Updating cache for user ${ifCached.user.name} (${ifCached.user.id}) with new roles ${user.roleIds}`);
    }
};
