import { Severity } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { ResolvedEnum, RoleType } from "../../typings";
import { Category, Command } from "../commands";

enum MutableSeverities {
    MUTE = "MUTE",
    KICK = "KICK",
    SOFTBAN = "SOFTBAN",
    BAN = "BAN",
}

const Threshold: Command = {
    name: "severity-threshold",
    description: "Sets how many infraction points are required for each level of moderation severity.",
    // usage: "<severity> <infraction points required> [duration]",
    examples: ["mute 20 10m", "kick 40"],
    subCommand: true,
    category: Category.Settings,
    subName: "threshold",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "severity", type: "enum", values: MutableSeverities },
        { name: "infractions", display: "infraction points required", type: "number", optional: true },
        { name: "duration", type: "time", optional: true },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const severity = (args.severity as ResolvedEnum)?.resolved as Severity;
        const infractions = args.infractions as number;
        const duration = args.duration as number;

        const propName = `${severity.toLowerCase()}InfractionThreshold`;
        const isMute = severity === Severity.MUTE;

        if (!infractions) {
            return ctx.messageUtil.replyWithInfo(
                message,
                "Current severity",
                stripIndents`
			Action ${inlineCode(severity)}'s infraction point threshold is ${commandCtx.server[propName] ? inlineCode(commandCtx.server[propName]) : "nothing"} infraction points.
			${isMute && commandCtx.server.muteInfractionDuration ? ` It will also apply a duration of ${inlineCode(commandCtx.server.muteInfractionDuration / 1000 / 60)} minutes.` : ""}`
            );
        }

        let muteDuration;
        if (duration) {
            if (!isMute) return ctx.messageUtil.replyWithError(message, `Durations are only valid on mute severity`, "");
            // const duration = ms(durationArg);
            if (!duration || duration < 900000 || duration > 172800000) return ctx.messageUtil.replyWithError(message, `Invalid Duration`, `Duration must be between 15m and 48h.`);
            muteDuration = duration;
        }

        await ctx.prisma.server.updateMany({ data: { [propName]: infractions, muteInfractionDuration: muteDuration ?? null }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Infraction points changed`,
            `Action ${inlineCode(severity.toLowerCase())} will now require ${inlineCode(infractions)} infraction points.${
                muteDuration ? ` It will also apply a duration of ${inlineCode(muteDuration / 1000 / 60)} minutes.` : ""
            }`
        );
    },
};

export default Threshold;
