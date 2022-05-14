import { RoleType } from "@prisma/client";

import type { Command } from "../Command";

const Enroll: Command = {
    name: "beta-enroll",
    description: "Enroll a server into the beta.",
    usage: "<serverId> [roleId]",
    subCommand: true,
    hidden: true,
    subName: "enroll",
    ownerOnly: true,
    args: [
        { name: "serverId", type: "string" },
        { name: "roleId", type: "number", optional: true },
    ],
    execute: async (message, args, ctx) => {
        const serverId = args.serverId as string;
        const roleId = Math.floor(args.roleId as number);
        const server = await ctx.dbUtil.getServer(serverId);

        if (server.flags.includes("EARLY_ACCESS")) return ctx.messageUtil.replyWithAlert(message, `Already in beta`, `That server is already in the early access!`);
        server.flags.push("EARLY_ACCESS");

        await ctx.prisma.server.updateMany({ where: { id: server.id }, data: { flags: server.flags } });
        if (!isNaN(roleId)) await ctx.prisma.role.create({ data: { type: RoleType.ADMIN, serverId, roleId } });
        return ctx.messageUtil.replyWithSuccess(message, `Beta enrolled`, `Server is now enrolled in the early access.`);
    },
};

export default Enroll;
