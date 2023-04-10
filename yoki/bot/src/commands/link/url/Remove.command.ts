import { RoleType } from "../../../typings";
import { inlineQuote } from "@yokilabs/util";
import { MAX_URL_LENGTH, ONLY_URL_REGEX } from "../../../utils/matching";
import { Category, Command } from "../../commands";

const Remove: Command = {
    name: "link-url-remove",
    subName: "remove",
    description: "Removes a domain from the blacklist or whitelist.",
    usage: "<domain>",
    subCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "url",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const url = (args.url as string).toLowerCase();

        // To not match long
        if (url.length > MAX_URL_LENGTH) return ctx.messageUtil.replyWithError(message, `Too long`, `The provided URL is too long and cannot be saved by Yoki.`);

        const urlMatch = url.match(ONLY_URL_REGEX);
        if (urlMatch === null) return ctx.messageUtil.replyWithError(message, `Bad formatting`, `The provided text is not a URL.`);

        const { domain, subdomain, route } = urlMatch.groups as { domain: string; subdomain?: string; route?: string };

        // I don't like this code
        if (domain.length > 255 || (subdomain?.length && subdomain.length > 100) || (route?.length && route.length > 200))
            return ctx.messageUtil.replyWithError(
                message,
                `Too long`,
                `The provided URL's ${domain.length > 200 ? "domain" : subdomain && subdomain?.length > 100 ? "subdomain" : "route"} is way too long.`
            );

        const existingEntry = await ctx.prisma.urlFilter.findFirst({ where: { serverId: message.serverId!, domain } });
        if (!existingEntry) return ctx.messageUtil.replyWithError(message, `Link not found`, `This domain is not in your server's filter!`);
        await ctx.dbUtil.removeUrlFromFilter(message.serverId!, domain, subdomain, route);
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Link deleted`,
            `Successfully removed ${inlineQuote(`${subdomain ?? ""}${domain}${route ?? ""}`)} from the URL automod list!`
        );
    },
};

export default Remove;
