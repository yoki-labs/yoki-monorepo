import { RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { Category, Command } from "../commands";

const allowedTypes = ["MINIMOD", "MOD", "ADMIN"];

const Staff: Command = {
    name: "role-staff",
    description: "Adds moderator/staff roles.",
    subCommand: true,
    // usage: "[role] [minimod/mod/admin/remove]",
    examples: ["12345678", "12345678 admin", "12345678 remove"],
    subName: "staff",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "role", type: "number", optional: true },
        { name: "staffLevel", display: "minimod / mod / admin / remove", type: "string", optional: true },
    ],
    execute: async (message, args, ctx) => {
        const modroleId = (args.role as number) ?? null;
        const levelArg = (args.staffLevel as string)?.toUpperCase();

        // Remove the staff role if it's not a level passed
        if (levelArg === "REMOVE") {
            if (!(await ctx.prisma.role.findFirst({ where: { serverId: message.serverId!, roleId: modroleId } })))
                return ctx.messageUtil.replyWithError(message, `Not a staff role`, `The given role is not a mod/admin role or does not exist.`);

            await ctx.prisma.role.deleteMany({ where: { roleId: modroleId, serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Removed staff role`, `<@${modroleId}> is no longer a staff role.`, undefined, { isSilent: true });
        }

        const staffLevel = RoleType[allowedTypes.includes(levelArg) ? levelArg : "MOD"] ?? RoleType.MOD;

        if (!modroleId) {
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId! } });
            return modRoles.length
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      `Staff roles`,
                      stripIndents`
                        Here are the staff roles for this server:\n- ${modRoles.map((modRole) => `<@${modRole.roleId}> (${inlineCode(modRole.type)})`).join("\n- ")}
                    `,
                      undefined,
                      {
                          isSilent: true,
                      }
                  )
                : ctx.messageUtil.replyWithNullState(message, `No staff roles`, `There are no staff roles set for this server yet.`);
        }
        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId!, roleId: modroleId, type: staffLevel } });
        if (existing.find((x) => x.roleId === modroleId))
            return ctx.messageUtil.replyWithError(message, `Already a staff role`, `This role has already been set as ${staffLevel}.`);

        await ctx.prisma.role.create({
            data: {
                roleId: modroleId,
                type: staffLevel,
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.replyWithSuccess(message, `Staff role added`, `Successfully added <@${modroleId}> as a ${staffLevel} role`);
    },
};

export default Staff;
