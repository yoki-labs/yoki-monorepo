import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const UrlWhitelist: Command = {
    name: "link-url-urlwhitelist",
    subName: "urlwhitelist",
    description: "Sets whether the URL filter is whitelisted or blacklisted.",
    usage: "<is whitelist>",
    examples: ["true", "false"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "isWhitelist",
            type: "boolean",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const isWhitelist = args.isWhitelist as boolean | null;

        if (isWhitelist === null) {
            const [what, greylist] = server.urlFilterIsWhitelist ? ["URLs outside the list", "Whitelist"] : ["URLs in the list", "Blacklist"];
            return ctx.messageUtil.replyWithInfo(message, `${greylist} URL filter`, `Only ${what} will be removed.`);
        }

        await ctx.prisma.server.update({ where: { serverId: server.serverId }, data: { urlFilterIsWhitelist: isWhitelist } });

        const greylist = isWhitelist ? "whitelist" : "blacklist";

        return ctx.messageUtil.replyWithSuccess(message, `URL filter settings changed`, `URL filter list is now a ${greylist}.`);
    },
};

export default UrlWhitelist;
