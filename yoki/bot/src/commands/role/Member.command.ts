import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { addOrRemoveMemberRoleMessage } from "../../utils/util";
import { Category, Command } from "../commands";

const Member: Command = {
    name: "role-member",
    description: "Set or view the member role for this server.",
    usage: "[role mention or ID/remove]",
    examples: ["12345678", ""],
    category: Category.Settings,
    subCommand: true,
    subName: "member",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "role", optional: true, type: "string" }],
    execute: async (message, args, ctx, commandCtx) => {
        const role = args.role as string | undefined;

        // Just display if it's unspecified
        if (!role) {
            const { memberRoleId } = commandCtx.server;

            return memberRoleId
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      `Member role`,
                      stripIndents`
                    The member role is set to role <@${memberRoleId}>.

                    ${addOrRemoveMemberRoleMessage(commandCtx.server.getPrefix())}
                `,
                      undefined,
                      { isSilent: true }
                  )
                : ctx.messageUtil.replyWithNullState(message, `No member role`, `There is no member role set.`);
        }
        if (role.toUpperCase() === "REMOVE") {
            // The ability to delete member roles
            await ctx.prisma.server.updateMany({ data: { memberRoleId: null }, where: { serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Member role removed`, `<@${commandCtx.server.memberRoleId}> is no longer the member role.`, undefined, {
                isSilent: true,
            });
        }

        const roleId = role ? Number(role as string) : null;

        // This could be merged back with `if (!role)`, but I am too lazy to handle it well with
        // `REMOVE` + it is better to tell someone they are wrong than just make them confused
        if (Number.isNaN(roleId))
            return ctx.messageUtil.replyWithError(
                message,
                `Provide role`,
                `Provide a valid ID or mention of the role you want to set as a member role or pass \`remove\` to remove it.`
            );

        await ctx.prisma.server.updateMany({ data: { memberRoleId: roleId }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Member role set`, `Successfully set <@${roleId}> as the member role`, undefined, { isSilent: true });
    },
};

export default Member;
