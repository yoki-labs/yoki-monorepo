import { RoleType } from "../../../typings";
import { inlineQuote } from "../../../utils/formatters";
import { isDomain } from "../../../utils/util";
import { Category } from "../../Category";
import type { Command } from "../../Command";

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
            name: "domain",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const domain = (args.domain as string).toLowerCase();

        if (!isDomain(domain)) return ctx.messageUtil.replyWithError(message, `Only domains`, `Only domains are available to be whitelisted/blacklisted at this time.`);

        const existingEntry = await ctx.prisma.urlFilter.findFirst({ where: { serverId: message.serverId!, domain } });
        if (!existingEntry) return ctx.messageUtil.replyWithError(message, `Link not found`, `This domain is not in your server's filter!`);
        await ctx.dbUtil.removeUrlFromFilter(message.serverId!, domain);
        return ctx.messageUtil.replyWithSuccess(message, `Link deleted`, `Successfully removed ${inlineQuote(domain)} from the automod list!`);
    },
};

export default Remove;
