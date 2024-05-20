import { inlineCode } from "@yokilabs/bot";

import { ResolvedEnum, RoleType, Severity } from "../../typings";
import { Category, Command } from "../commands";

const NsfwSeverity: Command = {
    name: "nsfw-severity",
    subName: "severity",
    description: "Set the severity and the infraction points of non-whitelisted links.",
    // usage: "<severity> <infraction points>",
    examples: ["warn 5"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Settings,
    args: [
        {
            name: "severity",
            type: "enum",
            optional: true,
            values: Severity,
        },
        {
            name: "infractions",
            display: "infraction points",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const severity = (args.severity as ResolvedEnum | null)?.resolved as Severity | null;

        const infractions = args.infractions as number | null;

        if (severity === null)
            return ctx.messageUtil.replyWithInfo(
                message,
                `NSFW image info`,
                `NSFW images will result in ${inlineCode(server.linkInfractionPoints)} infraction points and a ${inlineCode(server.linkSeverity)}.`
            );

        await ctx.prisma.server.update({
            where: { serverId: server.serverId },
            data: { nsfwInfractionPoints: infractions ?? server.linkInfractionPoints, nsfwSeverity: severity },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `NSFW infraction changed`,
            `NSFW images will now give ${inlineCode(infractions ?? server.linkInfractionPoints)} infraction points and a ${inlineCode(severity ?? server.linkSeverity)}.`
        );
    },
};

export default NsfwSeverity;
