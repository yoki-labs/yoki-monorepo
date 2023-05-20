import { inlineQuote, isHashId } from "@yokilabs/bot";

import { RoleType } from "../../../typings";
import { Category, Command } from "../../commands";

const Add: Command = {
    name: "link-invite-add",
    subName: "add",
    description: "Add a vanity url to the invite __whitelist__.",
    // usage: "<server id>",
    examples: ["4R56dNkl"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Filter,
    args: [
        {
            name: "targetServerId",
            display: "server ID",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        if (!server.filterInvites)
            return ctx.messageUtil.replyWithError(message, `Enable invite scan`, `Invite scan is disabled! Please enable using \`${server.getPrefix()}module enable invitescan\``);
        const targetServerId = args.targetServerId as string;

        if (!isHashId(targetServerId)) return ctx.messageUtil.replyWithError(message, `Expected ID`, `Expected server ID, not its vanity URL.`);

        const doesExistAlready = await ctx.prisma.inviteFilter.findFirst({ where: { serverId: message.serverId!, targetServerId } });
        if (doesExistAlready) return ctx.messageUtil.replyWithError(message, `Already added`, `This server is already in your server's invite whitelist!`);

        await ctx.dbUtil.addInviteToFilter({
            targetServerId,
            creatorId: message.authorId,
            serverId: message.serverId!,
        });
        return ctx.messageUtil.replyWithSuccess(message, `New server added`, `Successfully added ${inlineQuote(targetServerId)} to the invite whitelist!`);
    },
};

export default Add;
