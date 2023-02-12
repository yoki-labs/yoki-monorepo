import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const Unban: Command = {
	name: "unban",
	description: "unban a user.",
	usage: "<targetId>",
	examples: ["R40Mp0Wd"],
	requiredRole: RoleType.MOD,
	category: Category.Moderation,
	args: [
		{
			name: "targetId",
			type: "string",
		}
	],
	execute: async (message, args, ctx) => {
		const target = args.targetId as string;

		try {
			await ctx.rest.router.unbanMember(message.serverId!, target);
		} catch (e) {
			return ctx.messageUtil.replyWithUnexpected(
				message,
				stripIndents`
                There was an issue unbanning this user. This is most likely due to the user not existing, or the bot not having permission to unban them.
            `,
				undefined,
				{ isPrivate: true }
			);
		}

		await ctx.messageUtil.sendSuccessBlock(
			message.channelId,
			`User unbanned`,
			`<@${message.createdBy}>, you have successfully unbanned ${inlineCode(target)}.`,
			undefined,
			{
				isPrivate: true,
			}
		);

		return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
	},
};

export default Unban;
