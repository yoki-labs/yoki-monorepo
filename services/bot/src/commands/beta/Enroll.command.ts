import type { Command } from "../Command";

const Enroll: Command = {
    name: "beta-enroll",
    description: "Enroll a server into the beta.",
    usage: "<serverId>",
    subCommand: true,
    hidden: true,
    subName: "enroll",
    ownerOnly: true,
    args: [{ name: "serverId", type: "string" }],
    execute: async (message, args, ctx) => {
        const serverId = args.serverId as string;
        const server = await ctx.serverUtil.getServer(serverId);

        if (server.flags.includes("EARLY_ACCESS")) return ctx.messageUtil.send(message.channelId, "That server is already in the early access!");
        server.flags.push("EARLY_ACCESS");

        await ctx.prisma.server.updateMany({ where: { id: server.id }, data: { flags: server.flags } });
        return ctx.messageUtil.send(message.channelId, `Server is now enrolled in the early access.`);
    },
};

export default Enroll;
