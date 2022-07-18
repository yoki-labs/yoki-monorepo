import { Severity } from "@prisma/client";

import { inlineCode } from "../../formatters";
import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Threshold: Command = {
    name: "config-threshold",
    description: "Sets how many infraction points are required for each moderation severity.",
    usage: "<severity> <infraction points required>",
    examples: ["mute 20"],
    subCommand: true,
    category: Category.Settings,
    subName: "threshold",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "severity", type: "enum", values: Severity },
        { name: "infractions", type: "number" },
    ],
    execute: async (message, args, ctx) => {
        const severity = args.severity as Severity;
        const infractions = args.infractions as number;

        if (severity === Severity.WARN) return ctx.messageUtil.replyWithAlert(message, `Immutable warn threshold`, `You cannot change infraction points requirement for warnings.`);

        const propName = `${severity.toLowerCase()}InfractionThreshold`;

        await ctx.prisma.server.updateMany({ data: { [propName]: infractions }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Infraction points changed`, `${severity} will now require ${inlineCode(infractions)} infraction points.`);
    },
};

export default Threshold;
