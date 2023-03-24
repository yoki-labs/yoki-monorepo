import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { Severity } from "@prisma/client";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { inlineCode, listInlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const Unmute: Command = {
	name: "unmute",
	description: "Removes a mute from the specified user.",
	usage: "<target> [reason]",
	examples: ["R40Mp0Wd", "<@R40Mp0Wd> Stopped playing Town of Salem"],
	requiredRole: RoleType.MINIMOD,
	category: Category.Moderation,
	aliases: ["unhush", "untimeout", "um"],
	args: [
		{
			name: "target",
			type: "member",
		},
		{
			name: "reason",
			type: "rest",
			optional: true,
			max: 500,
		},
	],
	execute: async (message, args, ctx, commandCtx) => {
		if (!commandCtx.server.muteRoleId) return ctx.messageUtil.replyWithError(message, `No mute role set`, `There is no mute role configured for this server.`);
		const target = args.target as CachedMember;
		const reason = args.reason as string | null;

		if (target.user?.type === UserType.Bot) return ctx.messageUtil.replyWithError(message, `Cannot unmute bots`, `Bots cannot be unmuted.`);

		try {
			await ctx.roles.removeRoleFromMember(message.serverId!, target.user!.id, commandCtx.server.muteRoleId);
		} catch (e) {
			return ctx.messageUtil.replyWithUnexpected(
				message,
				stripIndents`
					There was an issue removing mute from this user. This is most likely due to misconfigured permissions for your server.
					${inlineCode((e as Error).message)}
				`,
				undefined,
				{ isPrivate: true }
			);
		}

		await ctx.prisma.action.updateMany({
			where: {
				type: Severity.MUTE,
				targetId: target.user!.id,
				expired: false,
			},
			data: {
				expired: true,
			},
		});

		let successMessage = `<@${message.authorId}>, you have successfully unmuted <@${target.user!.id}>.`;

		try {
			await ctx.messageUtil.sendInfoBlock(
				message.channelId,
				"You have been unmuted",
				`<@${target.user!.id}>, you have been manually unmuted by a staff member of this server.`,
				{
					fields: [
						reason && {
							name: "Reason",
							value: (reason as string).length > 1024 ? `${reason.substr(0, 1021)}...` : reason,
						},
					].filter(Boolean) as EmbedField[],
				},
				{
					isPrivate: true,
				}
			);
		} catch (error) {
			console.error(error);
			successMessage += "\n**I was unable to notify them.**";
		}

		const userRoles = await ctx.prisma.roleState.findFirst({ where: { serverId: message.serverId!, userId: target.user!.id } });
		if (userRoles) {
			const { failed } = await ctx.roleUtil.assignMultipleRoles(message.serverId!, target.user!.id, userRoles.roles);
			if (failed.length) {
				successMessage += `\n\nThere was an issue adding some roles back to this user due to improper permissions. The roles are: ${listInlineCode(failed)}`;
			}
		}

		await ctx.messageUtil.sendSuccessBlock(message.channelId, `User unmuted`, successMessage, undefined, {
			isPrivate: true,
		});
		return ctx.messages.delete(message.channelId, message.id);
	},
};

export default Unmute;
