import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";
import { Colors } from "../../utils/color";
import { inlineCode } from "../../utils/formatters";
import { summarizeItems } from "../../utils/messages";
import { WebhookEmbed } from "guilded.js";

export default {
	execute: async ([newMembers, _oldMembers, ctx]): Promise<void> => {
		const { serverId } = newMembers[0];

		// check if there's a log channel channel for message deletions
		const roleUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_roles_updates);
		if (roleUpdateLogChannel) {
			// Prevent showcasing too many
			const cappedRoleChanges = newMembers.members.slice(0, 4);

			const roleDifferences = cappedRoleChanges.map((member) => {
				const { roleIds, userId } = member;

				const previousState = ctx.members.cache.get(userId);

				if (!previousState) return { userId, roleIds };

				// Array difference
				const addedRoles = roleIds.filter((currentRole) => !previousState.roleIds.includes(currentRole));
				const removedRoles = previousState.roleIds.filter((previousRole) => !roleIds.includes(previousRole));

				return { addedRoles, removedRoles, roleIds, userId };
			});

			const modifiedUsers = summarizeItems(newMembers.members, (x) => `<@${x.userId}>`, 10);

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
	},
	name: "rolesUpdated"
} satisfies GEvent<"rolesUpdated">;
