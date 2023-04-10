import type { Command } from "../commands";

const Enable: Command = {
    name: "premium-disable",
    subName: "disable",
    description: "Disable premium on a server.",
    usage: "<serverId>",
    subCommand: true,
    devOnly: true,
    args: [
        {
            name: "serverId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const server = await ctx.prisma.server.findFirst({ where: { serverId: args.serverId as string } });
        if (!server?.premium) return ctx.messageUtil.replyWithError(message, `No premium`, "This server does not exist or have premium enabled.");
        await ctx.prisma.server.update({ where: { id: server.id }, data: { premium: null } });
        return ctx.messageUtil.replyWithSuccess(message, "Server removed from premium!", "The server will now lose access to all premium perks.");
    },
};

export default Enable;
