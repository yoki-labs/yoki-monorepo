import { PremiumType, Server, Severity } from "@prisma/client";
import { createServerLimit, inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { ResolvedEnum, RoleType } from "../../../typings";
import { MAX_URL_LENGTH, ONLY_URL_REGEX } from "../../../utils/matching";
import { Category, Command } from "../../commands";

const getServerLimit = createServerLimit<PremiumType, Server>({
    Gold: 200,
    Silver: 100,
    Copper: 75,
    Early: 50,
    Default: 50,
});

const Add: Command = {
    name: "link-url-add",
    subName: "add",
    description: "Add a domain to the blacklist or whitelist.",
    // usage: "<domain> [severity=warn] [infraction_points=5]",
    examples: ["example.com warn", "discord.com ban"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Filter,
    args: [
        {
            name: "url",
            type: "string",
        },
        {
            name: "severity",
            display: "severity = warn",
            type: "enum",
            optional: true,
            values: Severity,
        },
        {
            name: "infraction_points",
            display: "infraction points = 5",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        if (!server.filterEnabled)
            return ctx.messageUtil.replyWithError(message, `Enable automod`, `Automod link filter is disabled! Please enable using \`${server.getPrefix()}module enable automod\``);
        const url = args.url as string;
        const severity = ((args.severity as ResolvedEnum | null)?.resolved ?? Severity.WARN) as Severity;
        const infractionPoints = (args.infraction_points as number | null) ?? 5;
        
        // To not match long
        if (url.length > MAX_URL_LENGTH) return ctx.messageUtil.replyWithError(message, `Too long`, `The provided URL is too long and cannot be saved by Yoki.`);
        
        const urlMatch = url.match(ONLY_URL_REGEX);
        if (!urlMatch) return ctx.messageUtil.replyWithError(message, `Bad formatting`, `The provided text is not a URL.`);

        const { domain, subdomain, route } = urlMatch.groups as { domain: string; subdomain?: string; route?: string };

        // I don't like this code
        if (domain.length > 255 || (subdomain?.length && subdomain.length > 100) || (route?.length && route.length > 200))
            return ctx.messageUtil.replyWithError(
                message,
                `Too long`,
                `The provided URL's ${domain.length > 200 ? "domain" : subdomain && subdomain?.length > 100 ? "subdomain" : "route"} is way too long.`
            );

        const allUrls = await ctx.prisma.urlFilter.findMany({ where: { serverId: server.serverId } });

        // To not create too many of them for DB to blow up
        const serverLimit = getServerLimit(server);

        if (allUrls.length >= serverLimit)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many URLs",
                `You can only have ${serverLimit} filtered URLs per server.${server.premium ? "" : "\n\n**Note:** You can upgrade to premium to increase the limit."}`
            );
        else if (allUrls.some((x) => x.domain === domain && x.subdomain === subdomain && x.route === route))
            return ctx.messageUtil.replyWithError(message, `Already added`, `This URL is already in your server's filter!`);

        await ctx.dbUtil.addUrlToFilter({
            domain,
            subdomain: subdomain ?? null,
            route: route ?? null,
            creatorId: message.authorId,
            serverId: message.serverId!,
            severity,
            infractionPoints,
        });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `New link added`,
            `Successfully added ${inlineQuote(domain)} with the severity ${inlineCode(severity.toLowerCase())} to the automod list!`,
            {
                fields: [
                    {
                        name: "URL matching info",
                        value: stripIndents`
                            \`\`\`coffeescript
                            domain: ${domain}
                            subdomain: ${subdomain ?? "(none)"}
                            route: ${route ?? "(none)"}
                            \`\`\`
                        `,
                    },
                ],
            }
        );
    },
};

export default Add;
