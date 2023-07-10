import { RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Role } from "guilded.js";

import { addOrRemoveStaffRoleMessage } from "../../utils/util";
import { Category, Command } from "../commands";

const allowedTypes = ["MINIMOD", "MOD", "ADMIN"];

const Staff: Command = {
    name: "role-staff",
    description: "Adds moderator/staff roles.",
    subCommand: true,
    // usage: "[role] [minimod/mod/admin/remove]",
    examples: ["@admin admin", "12345678 admin", "12345678 remove"],
    subName: "staff",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "role", type: "role", optional: true },
        { name: "staffLevel", display: "minimod / mod / admin / remove", type: "string", optional: true },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const modrole = (args.role as Role | null) ?? null;
        const levelArg = (args.staffLevel as string)?.toUpperCase();

        // Remove the staff role if it's not a level passed
        if (modrole && levelArg === "REMOVE") {
            if (!(await ctx.prisma.role.findFirst({ where: { serverId: message.serverId!, roleId: modrole.id } })))
                return ctx.messageUtil.replyWithError(message, `Not a staff role`, `The given role is not a mod/admin role or does not exist.`);

            await ctx.prisma.role.deleteMany({ where: { roleId: modrole.id, serverId: message.serverId! } });
            return ctx.messageUtil.replyWithSuccess(message, `Removed staff role`, `<@${modrole.id}> is no longer a staff role.`, undefined, { isSilent: true });
        }

        const staffLevel = RoleType[allowedTypes.includes(levelArg) ? levelArg : "MOD"] ?? RoleType.MOD;

        if (!modrole) {
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId! } });
            return modRoles.length
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      `Staff roles`,
                      stripIndents`
                        Here are the staff roles for this server:\n- ${modRoles.map((modRole) => `<@${modRole.roleId}> (${inlineCode(modRole.type)})`).join("\n- ")}

                        ${addOrRemoveStaffRoleMessage(commandCtx.server.getPrefix())}
                    `,
                      undefined,
                      {
                          isSilent: true,
                      }
                  )
                : ctx.messageUtil.replyWithNullState(message, `No staff roles`, `There are no staff roles set for this server yet.`);
        }

        const roles = await ctx.roles.fetchMany(message.serverId!);
        const defaultRole = roles.find((x) => x.isBase);
        if (modrole.id === defaultRole?.id) return ctx.messageUtil.replyWithError(message, `Cannot set member as staff role`, `You cannot set the member role as a staff role.`);

        const existing = await ctx.prisma.role.findMany({ where: { serverId: message.serverId!, roleId: modrole.id, type: staffLevel } });
        if (existing.find((x) => x.roleId === modrole.id))
            return ctx.messageUtil.replyWithError(message, `Already a staff role`, `This role has already been set as ${staffLevel}.`);

        await ctx.prisma.role.create({
            data: {
                roleId: modrole.id,
                type: staffLevel,
                serverId: message.serverId!,
            },
        });

        await ctx.commandLogHandler.send(`Server ${message.serverId} has added a ${staffLevel} role. Added <@${modrole.id}> as a ${staffLevel} role`);
        return ctx.messageUtil.replyWithSuccess(message, `Staff role added`, `Successfully added <@${modrole.id}> as a ${staffLevel} role`);
    },
};

export default Staff;
