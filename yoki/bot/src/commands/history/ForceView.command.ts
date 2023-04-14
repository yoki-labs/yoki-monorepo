import { RoleType } from "../../typings";
import { Category,Command } from "../commands";
import { displayHistory } from "./util";

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

		await displayHistory(message, ctx, { where: { serverId: message.serverId!, targetId } }, page, `<@${targetId}>'s History`);
	},
};

export default ForceView;
