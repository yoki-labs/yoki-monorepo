import type { WSTeamRolesUpdatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context } from "../../typings";
import { Colors } from "../../utils/color";
import { inlineCode } from "../../utils/formatters";
import { summarizeItems } from "../../utils/messages";

export default async (event: WSTeamRolesUpdatedPayload, ctx: Context): Promise<void> => {
	const { serverId, memberRoleIds } = event.d;

	// Prevent repeation of `getCachedMember`
	const memberCaches = {};
	for (const memberRoleId of memberRoleIds) memberCaches[memberRoleId.userId] = ctx.serverUtil.getCachedMember(serverId, memberRoleId.userId);

	// check if there's a log channel channel for message deletions
	const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_roles_updates);
	if (roleUpdateLogChannel) {
		// Prevent showcasing too many
		const cappedRoleChanges = memberRoleIds.slice(0, 4);

		const roleDifferences = cappedRoleChanges.map(({ userId, roleIds }) => {
			const previousState = memberCaches[userId];

			if (!previousState) return { userId, roleIds };

			// Array difference
			const addedRoles = roleIds.filter((currentRole) => !previousState.roleIds.includes(currentRole));
			const removedRoles = previousState.roleIds.filter((previousRole) => !roleIds.includes(previousRole));

			return { addedRoles, removedRoles, roleIds, userId };
		});

		const modifiedUsers = summarizeItems(memberRoleIds, (x) => `<@${x.userId}>`, 10);

		try {
			// send the log channel message with the content/data of the deleted message
			await ctx.messageUtil.sendLog({
				where: roleUpdateLogChannel.channelId,
				title: `Member Roles Changed`,
				serverId,
				description: `${modifiedUsers} had their roles changed.`,
				color: Colors.blue,
				occurred: new Date().toISOString(),
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
		// check if this member is cached in our mem, indicates that they have some sort of elevated permission role
		const cachedMember = memberCaches[user.userId];

		if (cachedMember) {
			// update the cache with the old data but with updated roleIds
			await ctx.serverUtil.setMember(serverId, user.userId, { ...cachedMember, roleIds: user.roleIds });
			console.log(`Updating cache for user ${cachedMember.user.name} (${cachedMember.user.id}) with new roles ${user.roleIds}`);
		} else await ctx.serverUtil.getMember(serverId, user.userId, true, true);
	}
};
