import { stripIndents } from "common-tags";
import { Role } from "guilded.js";

import { RoleType } from "../../typings";
import { addOrRemoveMemberRoleMessage } from "../../utils/util";
import { Category, Command } from "../commands";

const Member: Command = {
    name: "role-member",
    description: "Set the role for people who get verified by Yoki.",
    // usage: "[role mention or ID/remove]",
    examples: ["12345678", "@Verified"],
    category: Category.Settings,
    subCommand: true,
    subName: "member",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "role", type: "role", optional: true },
        { name: "remove", type: "string", optional: true },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const role = args.role as Role | undefined;
        const remove = args.remove as string | undefined;

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

        if (remove?.toUpperCase() === "REMOVE") {
            // The ability to delete member roles
            await ctx.prisma.server.updateMany({ data: { memberRoleId: null }, where: { serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Member role removed`, `<@${commandCtx.server.memberRoleId}> is no longer the member role.`, undefined, {
                isSilent: true,
            });
        }

        // This could be merged back with `if (!role)`, but I am too lazy to handle it well with
        // `REMOVE` + it is better to tell someone they are wrong than just make them confused
        if (Number.isNaN(role.id))
            return ctx.messageUtil.replyWithError(
                message,
                `Provide role`,
                `Provide a valid ID or mention of the role you want to set as a member role or pass \`remove\` to remove it.`
            );

        await ctx.prisma.server.updateMany({ data: { memberRoleId: role.id }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Member role set`, `Successfully set <@${role.id}> as the member role`, undefined, { isSilent: true });
    },
};

export default Member;
