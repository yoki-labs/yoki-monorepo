import { stripIndents } from "common-tags";
import { EmbedField, UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { getInfractionsFrom } from "../../utils/moderation";
import { Category } from "../Category";
import type { Command } from "../Command";

const Warn: Command = {
	name: "warn",
	description: "Warn a user.",
	usage: "<target> [infraction points] [...reason]",
	requiredRole: RoleType.MINIMOD,
	category: Category.Moderation,
	aliases: ["alert", "w"],
	args: [
		{
			name: "target",
			type: "member",
		},
		{
			name: "infractionPoints",
			type: "string",
			optional: true,
		},
		{
			name: "reason",
			type: "rest",
			optional: true,
			max: 500,
		},
	],
	execute: async (message, args, ctx, commandCtx) => {
		const target = args.target as CachedMember;
		const [reason, infractionPoints] = getInfractionsFrom(args);

		if (target.user!.type === UserType.Bot) return ctx.messageUtil.replyWithError(message, `Cannot warn bots`, `Bots cannot be warned.`);

		void ctx.amp.logEvent({
			event_type: "BOT_MEMBER_WARN",
			user_id: message.authorId,
			event_properties: { serverId: message.serverId! },
		});
		try {
			await ctx.messageUtil.sendWarningBlock(
				message.channelId,
				"You have been warned",
				`<@${target.user!.id}>, you have been manually warned by a staff member of this server.`,
				{
					fields: [
						reason && {
							name: "Reason",
							value: (reason as string).length > 1021 ? `${(reason as string).substr(0, 1021)}...` : reason,
						},
					].filter(Boolean) as EmbedField[],
				},
				{
					isPrivate: true,
				}
			);
		} catch (e) {
			return ctx.messageUtil.replyWithUnexpected(
				message,
				stripIndents`
					There was an issue warning this user.
					${inlineCode((e as Error).message)}
				`,
				undefined,
				{ isPrivate: true }
			);
		}

		await ctx.dbUtil.addActionFromMessage(message, {
			reason,
			infractionPoints,
			targetId: target.user!.id,
			type: "WARN",
			expiresAt: null,
		}, commandCtx.server);

		await ctx.messageUtil.sendSuccessBlock(
			message.channelId,
			`User warned`,
			`<@${message.authorId}>, you have successfully warned ${target.user!.name} (${inlineCode(target.user!.id)}).`,
			undefined,
			{
				isPrivate: true,
			}
		);

		return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
	},
};

export default Warn;
