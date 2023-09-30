import { RoleType } from "@prisma/client";
import { Role } from "guilded.js";

import { Category, Command } from "../commands";

const ModmailSupport: Command = {
    name: "role-modmail",
    description: "Set the role that gets pinged when new modmail threads are created.",
    subCommand: true,
    // usage: "[ID of the role]",
    examples: ["", "28086950"],
    subName: "modmail",
    category: Category.Settings,
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
            const modmailRole = commandCtx.server.modmailPingRoleId;

            return modmailRole
                ? ctx.messageUtil.replyWithInfo(message, `Modmail support role`, `The modmail support role is set to role <@${modmailRole}>.`, undefined, { isSilent: true })
                : ctx.messageUtil.replyWithNullState(message, `No modmail support role`, `There is no modmail support role set.`);
        }

        if (remove?.toUpperCase() === "REMOVE") {
            // The ability to delete modmail support roles
            await ctx.prisma.server.updateMany({ data: { modmailPingRoleId: null }, where: { serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Modmail support role removed`, `<@${commandCtx.server.modmailPingRoleId}> is no longer the mute role.`, undefined, {
                isSilent: true,
            });
        }

        // This could be merged back with `if (!role)`, but I am too lazy to handle it well with
        // `REMOVE` + it is better to tell someone they are wrong than just make them confused
        if (Number.isNaN(role.id))
            return ctx.messageUtil.replyWithError(
                message,
                `Provide role`,
                `Provide the mention or ID of the role you want to set as a modmail support role or pass \`remove\` to remove it.`
            );

        await ctx.prisma.server.updateMany({ data: { muteRoleId: role.id }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail support role set`, `Successfully set <@${role.id}> as the modmail support role`, undefined, { isSilent: true });
    },
};

export default ModmailSupport;
