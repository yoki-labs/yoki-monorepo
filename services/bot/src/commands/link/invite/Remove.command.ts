import { RoleType } from "../../../typings";
import { inlineCode } from "../../../utils/formatters";
import { Category } from "../../Category";
import type { Command } from "../../Command";

const Remove: Command = {
    name: "link-domain-remove",
    subName: "remove",
    description: "Removes a server from the __whitelist__",
    usage: "<server id>",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "targetServerId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const targetServerId = args.targetServerId as string;

        const existingEntry = await ctx.prisma.inviteFilter.findFirst({ where: { serverId: message.serverId!, targetServerId } });
        if (!existingEntry) return ctx.messageUtil.replyWithAlert(message, `Link not found`, `This server is not in your server's invite whitelist!`);
        await ctx.dbUtil.removeInviteFromFilter(message.serverId!, targetServerId);
        return ctx.messageUtil.replyWithSuccess(message, `Server removed`, `Successfully removed ${inlineCode(targetServerId)} from the invite whitelist!`);
    },
};

export default Remove;
