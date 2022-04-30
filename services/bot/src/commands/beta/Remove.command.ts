import type { Command } from "../Command";

const Remove: Command = {
    name: "beta-remove",
    description: "Remove a server from the beta.",
    usage: "<serverId>",
    subCommand: true,
    hidden: true,
    subName: "remove",
    ownerOnly: true,
    args: [{ name: "serverId", type: "string" }],
    execute: async (message, args, ctx) => {
        const serverId = args.serverId as string;
        const server = await ctx.dbUtil.getServer(serverId);

        if (!server.flags.includes("EARLY_ACCESS")) return ctx.messageUtil.send(message.channelId, "That server is not in the early access!");
        server.flags.filter((x) => x !== "EARLY_ACCESS");

        await ctx.prisma.server.updateMany({ where: { id: server.id }, data: { flags: server.flags } });
        return ctx.messageUtil.send(message.channelId, `Server is removed from the early access.`);
    },
};

export default Remove;
