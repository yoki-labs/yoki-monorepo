import { PremiumType } from "@prisma/client";
import { ResolvedEnum } from "@yokilabs/bot";

import type { Command } from "../commands";

const Enable: Command = {
    name: "premium-enable",
    subName: "enable",
    description: "Enable premium on a server.",
    // usage: "<serverId> <tier>",
    subCommand: true,
    devOnly: true,
    args: [
        {
            name: "serverId",
            type: "string",
        },
        {
            name: "tier",
            type: "enum",
            values: PremiumType,
        },
    ],
    execute: async (message, args, ctx) => {
        const serverId = args.serverId as string;
        const tier = (args.tier as ResolvedEnum).resolved as PremiumType;

        const server = await ctx.prisma.server.findFirst({ where: { serverId } });
        if (!server) return ctx.messageUtil.replyWithError(message, `No server`, "That server does not exist!");

        await ctx.prisma.server.update({ where: { id: server.id }, data: { premium: tier } });

        return ctx.messageUtil.replyWithSuccess(message, "Success!", "This server is now enrolled in premium");
    },
};

export default Enable;
