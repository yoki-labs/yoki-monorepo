import { RoleType } from "@prisma/client";
import { stripIndents } from "common-tags";

import { Category } from "../Category";
import type { Command } from "../Command";

const allowedTypes = ["MOD", "ADMIN"];

const Modrole: Command = {
    name: "config-modrole",
    description: "Add a mod role.",
    subCommand: true,
    usage: "[newRole] [mod/admin]",
    subName: "modrole",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "newRole", type: "number", optional: true },
        { name: "staffLevel", type: "string", optional: true },
    ],
    execute: async (message, args, ctx) => {
        const newRole = (args.newRole as number) ?? null;
        const levelArg = (args.staffLevel as string)?.toUpperCase();
        const staffLevel = RoleType[allowedTypes.includes(levelArg) ? levelArg : "MOD"] ?? RoleType.MOD;

        if (!newRole) {
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, type: staffLevel } });
            return ctx.messageUtil.send(
                message.channelId,
                modRoles.length
                    ? stripIndents`
					The ${staffLevel} roles for this server:
					${modRoles.map((modRole) => `\`${modRole.roleId}\``).join("\n")}`
                    : `There are no ${staffLevel} roles configured for this server`
            );
        }
        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, roleId: newRole, type: staffLevel } });
        if (existing.find((x) => x.roleId === newRole)) return ctx.messageUtil.send(message.channelId, "That is already a mod role!");

        const newModRole = await ctx.prisma.role.create({
            data: {
                roleId: newRole,
                type: staffLevel,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.send(message.channelId, `Successfully set the ${staffLevel} role to \`${newModRole.roleId}\``);
    },
};

export default Modrole;
