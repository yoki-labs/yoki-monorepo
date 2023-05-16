import { inlineQuote, isHashId } from "@yokilabs/bot";

import { RoleType } from "../../../typings";
import { Category, Command } from "../../commands";

const Remove: Command = {
    name: "link-invite-remove",
    subName: "remove",
    description: "Removes a server from the __whitelist__.",
    usage: "<server id>",
    subCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "targetServerId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const targetServerId = args.targetServerId as string;

        if (!isHashId(targetServerId)) return ctx.messageUtil.replyWithError(message, `Expected ID`, `Expected server ID, not its vanity URL.`);

        const existingEntry = await ctx.prisma.inviteFilter.findFirst({ where: { serverId: message.serverId!, targetServerId } });
        if (!existingEntry) return ctx.messageUtil.replyWithError(message, `Link not found`, `This server is not in your server's invite whitelist!`);
        await ctx.dbUtil.removeInviteFromFilter(message.serverId!, targetServerId);
        return ctx.messageUtil.replyWithSuccess(message, `Server removed`, `Successfully removed ${inlineQuote(targetServerId)} from the invite whitelist!`);
    },
};

export default Remove;
