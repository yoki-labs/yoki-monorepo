import { RoleType } from "@prisma/client";

import type { Command } from "../Command";

const Filter: Command = {
    name: "modrole",
    description: "Add a role .",
    usage: "[id-of-new-role]",
    aliases: ["mod-role", "modroles", "set-modrole"],
    args: [{ name: "newRole", type: "string" }],
    modOnly: true,
    ownerOnly: true,
    execute: async (message, args, ctx) => {
        const newRole = Number(args.newRole as string);
        if (!isNaN(newRole)) return ctx.messageUtil.send(message.channelId, "That is not a valid role ID.");
        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, roleId: newRole, type: RoleType.MOD } });
        if (existing) return ctx.messageUtil.send(message.channelId, "That is already a mod role!");

        // temp remove all other mod roles until multiple mod roles are support (premium feature??)
        await ctx.prisma.role.deleteMany({ where: { serverId: message.serverId!, type: RoleType.MOD } });
        const newModRole = await ctx.prisma.role.create({
            data: {
                roleId: newRole,
                type: RoleType.MOD,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.send(message.channelId, `Successfully set the mod role to \`${newModRole.roleId}\``);
    },
};

export default Filter;
