import type { Severity } from "@prisma/client";

import { ResolvedEnum, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

enum MutableSeverities {
	MUTE = "MUTE",
	KICK = "KICK",
	SOFTBAN = "SOFTBAN",
	BAN = "BAN",
}

const Threshold: Command = {
	name: "severity-threshold",
	description: "Sets how many infraction points are required for each level of moderation severity.",
	usage: "<severity> <infraction points required>",
	examples: ["mute 20"],
	subCommand: true,
	category: Category.Settings,
	subName: "threshold",
	requiredRole: RoleType.ADMIN,
	args: [
		{ name: "severity", type: "enum", values: MutableSeverities },
		{ name: "infractions", type: "number" },
	],
	execute: async (message, args, ctx) => {
		const severity = (args.severity as ResolvedEnum)?.resolved.toLowerCase() as Severity;
		const infractions = args.infractions as number;

		const propName = `${severity.toLowerCase()}InfractionThreshold`;

		await ctx.prisma.server.updateMany({ data: { [propName]: infractions }, where: { serverId: message.serverId! } });
		return ctx.messageUtil.replyWithSuccess(message, `Infraction points changed`, `${severity.toLowerCase()} will now require ${inlineCode(infractions)} infraction points.`);
	},
};

export default Threshold;
