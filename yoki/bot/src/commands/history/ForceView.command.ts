import type { Action } from "@prisma/client";

import { ContentFilterUtil } from "../../modules/content-filter";
import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

// ID -- 17; Text -- 24; Max reason -- 100; Max filtered word length -- 59
const maxReason = 100;
const maxFiltered = 59;
const maxCase = 17 + 26 + maxReason + maxFiltered;
// How many cases to show per page
const maxCases = Math.floor(2048 / maxCase);

const ForceView: Command = {
	name: "history-forceview",
	subName: "forceview",
	description: "Get the list of moderation cases of a user. Regardless of if they're in the server or not.",
	usage: "<targetId> [page number]",
	examples: ["R40Mp0Wd", "R40Mp0Wd 2"],
	subCommand: true,
	aliases: ["see", "all", "v"],
	requiredRole: RoleType.MINIMOD,
	category: Category.Moderation,
	args: [
		{
			name: "targetId",
			type: "string",
		},
		{
			name: "page",
			type: "number",
			optional: true,
		},
	],
	execute: async (message, args, ctx) => {
		const targetId = args.targetId as string;
		const page = args.page ? Math.floor((args.page as number) - 1) : 0;
		const actions = await ctx.prisma.action.findMany({
			where: {
				serverId: message.serverId!,
				targetId,
			},
		});
		if (!actions.length) return ctx.messageUtil.replyWithNullState(message, `Squeaky clean history!`, `This user does not have any moderation history associated with them... or they do not exist`);

		// -1, -2, etc.
		if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);


		return ctx.messageUtil.replyWithPaginatedContent<Action>({
			replyTo: message,
			items: actions,
			title: `${targetId}'s History`,
			itemMapping: (x) => {
				const trimmedReason = x.reason && x.reason.length > maxReason ? `${x.reason.substring(0, maxReason)}...` : x.reason;

				return `**${x.type}** - \`${trimmedReason ?? "no provided reason"}\` (${inlineCode(x.id)})  ${(x.triggerContent && `||${x.triggerContent.length > maxFiltered ? `${x.triggerContent}...` : x.triggerContent}||`) ?? ""}`;
			},
			itemsPerPage: maxCases,
			page,
			embed: {
				fields: [
					{
						name: "Total Infraction Points",
						value: ContentFilterUtil.totalAllInfractionPoints(actions).toString(),
					},
				],
			},
		});
	},
};

export default ForceView;
