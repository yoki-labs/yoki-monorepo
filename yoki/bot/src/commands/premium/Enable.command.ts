import { PremiumType } from "@prisma/client";

import type { Command } from "../commands";

const TierTypes = {
    gold: PremiumType.Gold,
    silver: PremiumType.Silver,
};

const Enable: Command = {
    name: "premium-enable",
    subName: "enable",
    description: "Enable premium on a server.",
    usage: "<serverId> <tier>",
    subCommand: true,
    devOnly: true,
    args: [
        {
            name: "serverId",
            type: "string",
        },
        {
            name: "tier",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const serverId = args.serverId as string;
        const tier = TierTypes[args.tier as string];

        if (!tier) return ctx.messageUtil.replyWithError(message, `No tier`, "That tier type doesn't exist!");
        const server = await ctx.prisma.server.findFirst({ where: { serverId } });
        if (!server) return ctx.messageUtil.replyWithError(message, `No server`, "That server does not exist!");
        await ctx.prisma.server.update({ where: { id: server.id }, data: { premium: tier } });
        return ctx.messageUtil.replyWithSuccess(message, "Success!", "This server is now enrolled in premium");
    },
};

export default Enable;
