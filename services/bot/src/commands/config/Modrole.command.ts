import { RoleType } from "@prisma/client";
import { stripIndents } from "common-tags";

import type { Command } from "../Command";

const Modrole: Command = {
    name: "config-modrole",
    description: "Add a mod role.",
    subCommand: true,
    usage: "modrole [newRole]",
    subName: "modrole",
    args: [{ name: "newRole", type: "string", optional: true }],
    execute: async (message, args, ctx) => {
        const newRole = args.newRole ? Number(args.newRole as string) : null;
        if (!newRole) {
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, type: RoleType.MOD } });
            return ctx.messageUtil.send(
                message.channelId,
                stripIndents`
				The mod roles for this server:
				${modRoles.map((modRole) => `\t- \`${modRole.roleId}\``).join("\n")}
			`
            );
        }
        if (isNaN(newRole)) return ctx.messageUtil.send(message.channelId, "That is not a valid role ID.");
        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, roleId: newRole, type: RoleType.MOD } });
        if (existing.find((x) => x.roleId === newRole)) return ctx.messageUtil.send(message.channelId, "That is already a mod role!");

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

export default Modrole;
