import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";
import { displayHistory } from "./util";

const View: Command = {
	name: "history-view",
	subName: "view",
	description: "Get the list of moderation cases of a user.",
	usage: "<target> [page number]",
	examples: ["R40Mp0Wd", "R40Mp0Wd 2"],
	subCommand: true,
	aliases: ["see", "all", "v"],
	requiredRole: RoleType.MINIMOD,
	category: Category.Moderation,
	args: [
		{
			name: "target",
			type: "member",
		},
		{
			name: "page",
			type: "number",
			optional: true,
		},
	],
	execute: async (message, args, ctx) => {
		const target = args.target as CachedMember;
		const page = args.page ? Math.floor((args.page as number) - 1) : 0;

		await displayHistory(message, ctx, { where: { serverId: message.serverId!, targetId: target.user!.id } }, page, `<@${target.user!.id}>'s History`);
	},
};

export default View;
