import { createServerLimit, inlineQuote } from "@yokilabs/bot";
import { isHashId } from "@yokilabs/utils";

import { RoleType } from "../../../typings";
import { Category, Command } from "../../commands";
import { PremiumType, Server } from "@prisma/client";

const getServerLimit = createServerLimit<PremiumType, Server>({
    Gold: 200,
    Silver: 100,
    Copper: 75,
    Early: 50,
    Default: 50,
});

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

        const allInvites = await ctx.prisma.inviteFilter.findMany({ where: { serverId: server.serverId } });

        // To not create too many of them for DB to blow up
        const serverLimit = getServerLimit(server);

        if (allInvites.length >= serverLimit)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many invites",
                `You can only have ${serverLimit} filtered invites per server.${server.premium ? "" : "\n\n**Note:** You can upgrade to premium to increase the limit."}`
            );
        else if (allInvites.some((x) => x.targetServerId === targetServerId))
            return ctx.messageUtil.replyWithError(message, `Already added`, `This server is already in your server's invite whitelist!`);

        await ctx.dbUtil.addInviteToFilter({
            targetServerId,
            creatorId: message.authorId,
            serverId: message.serverId!,
        });
        return ctx.messageUtil.replyWithSuccess(message, `New server added`, `Successfully added ${inlineQuote(targetServerId)} to the invite whitelist!`);
    },
};

export default Add;
