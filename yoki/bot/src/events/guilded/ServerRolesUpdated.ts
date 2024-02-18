import { LogChannelType } from "@prisma/client";
import { inlineCode, summarizeItems } from "@yokilabs/bot";
import { Colors, GuildedImages } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import type { GEvent, LogChannel } from "../../typings";
import { Member } from "guilded.js";
import YokiClient from "../../Client";

export default {
    execute: async ([event, oldMembers, ctx]): Promise<unknown> => {
        const { serverId, members: newMembers } = event;

        // check if there's a log channel channel for message deletions
        const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_roles_updates);

        if (!roleUpdateLogChannel) return;
        else if (newMembers.length > 1)
            return onMultipleUsersModified(ctx, serverId, roleUpdateLogChannel, newMembers, oldMembers);

        const member = newMembers[0];
        const oldMember = oldMembers[0];
        const memberInfo = oldMember ?? await ctx.members.fetch(serverId, member.userId);
        const { addedRoles, removedRoles, roleIds, userId } = getRoleState(member.userId, member.roleIds, oldMember);

        const hadBothOrUnknown = !((addedRoles?.length ?? 0) ^ (removedRoles?.length ?? 0));
        const [title, message, color] = hadBothOrUnknown
            ? [`Member roles modified`, `had their roles modified.\n\n**Current role list:** ${roleIds.map((x) => `<@${x}>`).join(", ")}`, Colors.blockBackground]
            : addedRoles?.length
            ? [`Member role added`, `had the following roles given: ${addedRoles.map((x) => `<@${x}>`).join(", ")}.`, Colors.green]
            : [`Member role removed`, `had the following roles removed: ${removedRoles!.map((x) => `<@${x}>`).join(", ")}.`, Colors.red];

        // Handle it with single member
        return ctx.messageUtil.sendLog({
            where: roleUpdateLogChannel.channelId,
            serverId,
            color,
            description: `<@${userId}> (${inlineCode(userId)}) ${message}`,
            author: {
                name: `${title} \u2022 ${memberInfo.displayName}`,
                icon_url: memberInfo.user?.avatar ?? GuildedImages.defaultAvatar,
            }
        })
    },
    name: "rolesUpdated",
} satisfies GEvent<"rolesUpdated">;

function getRoleDifference(previousRoleIds: number[], roleIds: number[]): [number[], number[]] {
    return [
        // Added roles
        roleIds
            .filter((currentRole) => !previousRoleIds.includes(currentRole)),
        // Removed roles
        previousRoleIds
            .filter((previousRole) => !roleIds.includes(previousRole))
    ];
}

function getRoleState(userId: string, roleIds: number[], previousState: Member | undefined) {
    if (!previousState) return { userId, roleIds };

    // Array difference
    const [addedRoles, removedRoles] = getRoleDifference(previousState.roleIds, roleIds);
    
    return { addedRoles, removedRoles, roleIds, userId };
}

function onMultipleUsersModified(ctx: YokiClient, serverId: string, roleUpdateLogChannel: LogChannel, newMembers: Array<{ userId: string; roleIds: number[]; }>, oldMembers: Member[]) {
    // Prevent showcasing too many
    const cappedRoleChanges = newMembers.slice(0, 4);

    const roleDifferences = cappedRoleChanges.map((member) => {
        const { roleIds, userId } = member;

        const previousState = oldMembers.find((x) => x.id === member.userId);

        return getRoleState(userId, roleIds, previousState);
    });

    const modifiedUsers = summarizeItems(newMembers, (x) => `<@${x.userId}>`, 10);

    // send the log channel message with the content/data of the deleted message
    return ctx.messageUtil.sendLog({
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