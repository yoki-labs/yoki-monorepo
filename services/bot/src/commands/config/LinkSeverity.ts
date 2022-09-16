import { RoleType, Severity } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const LinkSeverity: Command = {
    name: "link-url-linkseverity",
    subName: "linkseverity",
    description: "Sets severity and infraction points of non-whitelisted links.",
    usage: "<severity> <infraction points>",
    examples: ["warn 5"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "severity",
            type: "enum",
            optional: true,
            values: Severity,
        },
        {
            name: "infractions",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const severity = args.severity as Severity | null;
        const infractions = args.infractions as number | null;

        if (severity === null)
            return ctx.messageUtil.replyWithInfo(
                message,
                `Link Infraction`,
                `Non-whitelisted URLs or invites will result in ${inlineCode(server.linkInfractionPoints)} infraction points and a ${inlineCode(server.linkSeverity)}.`
            );

        await ctx.prisma.server.update({
            where: { serverId: server.serverId },
            data: { linkInfractionPoints: infractions ?? server.linkInfractionPoints, linkSeverity: severity },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Link Infraction Changed`,
            `Non-whitelisted URLs or invites will now give ${inlineCode(server.linkInfractionPoints)} infraction points and a ${inlineCode(server.linkSeverity)}.`
        );
    },
};

export default LinkSeverity;
