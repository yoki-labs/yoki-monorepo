import { inlineCode } from "@yokilabs/bot";

import { ResolvedEnum, RoleType, Severity } from "../../typings";
import { Category, Command } from "../commands";

const LinkSeverity: Command = {
    name: "link-severity",
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
        console.log(severity);
        const infractions = args.infractions as number | null;

        if (severity === null)
            return ctx.messageUtil.replyWithInfo(
                message,
                `Link infraction info`,
                `Non-whitelisted URLs or invites will result in ${inlineCode(server.linkInfractionPoints)} infraction points and a ${inlineCode(server.linkSeverity)}.`
            );

        await ctx.prisma.server.update({
            where: { serverId: server.serverId },
            data: { linkInfractionPoints: infractions ?? server.linkInfractionPoints, linkSeverity: severity },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Link infraction changed`,
            `Non-whitelisted URLs or invites will now give ${inlineCode(infractions ?? server.linkInfractionPoints)} infraction points and a ${inlineCode(
                severity ?? server.linkSeverity
            )}.`
        );
    },
};

export default LinkSeverity;
