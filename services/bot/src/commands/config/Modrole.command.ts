import { RoleType } from "@prisma/client";

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
            return modRoles.length
                ? ctx.messageUtil.replyWithContent(
                      message,
                      `Staff roles`,
                      `Here are the staff roles for this server:\n- ${modRoles.map((modRole) => `\`${modRole.roleId}\` (${modRole.type})`).join("\n- ")}`
                  )
                : ctx.messageUtil.replyWithNullState(message, `No staff roles`, `There are no staff roles set for this server yet.`);
        }
        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, roleId: newRole, type: staffLevel } });
        if (existing.find((x) => x.roleId === newRole)) return ctx.messageUtil.replyWithAlert(message, `Already a staff role`, `This role has already been set as ${staffLevel}.`);

        const newModRole = await ctx.prisma.role.create({
            data: {
                roleId: newRole,
                type: staffLevel,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.replyWithSuccess(message, `Staff role added`, `Successfully set the ${staffLevel} role to \`${newModRole.roleId}\``);
    },
};

export default Modrole;
