import { Severity } from "@prisma/client";

import { RoleType } from "../../../typings";
import { inlineCode } from "../../../utils/formatters";
import { Category } from "../../Category";
import type { Command } from "../../Command";

const Add: Command = {
    name: "link-url-add",
    subName: "add",
    description: "Add a domain to the __blacklist__",
    usage: "<domain> [severity=warn] [infraction_points=5]",
    examples: ["example.com warn", "discord.com ban"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "domain",
            type: "string",
        },
        {
            name: "severity",
            type: "enum",
            optional: true,
            values: Severity,
        },
        {
            name: "infraction_points",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        if (!server.filterEnabled)
            return ctx.messageUtil.replyWithAlert(message, `Enable automod`, `Automod link filter is disabled! Please enable using \`${server.getPrefix()}module enable automod\``);
        const domain = (args.domain as string).toLowerCase();
        const severity = (args.severity as Severity | null) ?? Severity.WARN;
        const infractionPoints = (args.infraction_points as number | null) ?? 5;

        if (!severity) return ctx.messageUtil.replyWithAlert(message, `No such severity level`, `Sorry, but that is not a valid severity level!`);
        if (infractionPoints < 0 || infractionPoints > 100)
            return ctx.messageUtil.replyWithAlert(message, `Points over the limit`, `Sorry, but the infraction points must be between 0 and 100.`);

        const doesExistAlready = await ctx.prisma.urlFilter.findFirst({ where: { serverId: message.serverId!, domain } });
        if (doesExistAlready) return ctx.messageUtil.replyWithAlert(message, `Already added`, `This domain is already in your server's filter!`);

        await ctx.dbUtil.addUrlToFilter({
            domain,
            creatorId: message.createdBy,
            serverId: message.serverId!,
            severity,
            infractionPoints,
        });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `New link added`,
            `Successfully added ${inlineCode(domain)} with the severity ${inlineCode(severity)} to the automod list!`
        );
    },
};

export default Add;
