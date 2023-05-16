import { RoleType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { removePingRole } from "../../utils/util";
import { Category, Command } from "../commands";

const PingRole: Command = {
    name: "modmail-pingrole",
    description: "Set the role that gets pinged when new modmail threads are created.",
    subCommand: true,
    usage: "[ID of the role]",
    examples: ["", "28086950"],
    subName: "pingrole",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "role", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const role = args.role as string | null;
        const unsetPingRole = removePingRole(commandCtx.server.getPrefix());

        // No argument? Give info instead
        if (!role) {
            return commandCtx.server.modmailPingRoleId
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      "Modmail ping role",
                      stripIndents`
					  This server's modmail ping role has been set as the ID ${inlineCode(commandCtx.server.modmailPingRoleId)}.
					  
					  ${unsetPingRole}
					  `
                  )
                : ctx.messageUtil.replyWithNullState(
                      message,
                      "No modmail ping role",
                      "This server does not have modmail ping role set.\n\n*If you would like to set a ping role please rerun this command with the ID of the role you want to set suffixed.*"
                  );
        }
        if (role.toUpperCase() === "REMOVE") {
            // The ability to delete modmail ping roles
            await ctx.prisma.server.updateMany({ data: { modmailPingRoleId: null }, where: { serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Member role removed`, `<@${commandCtx.server.modmailPingRoleId}> is no longer the modmail ping role.`, undefined, {
                isSilent: true,
            });
        }

        const roleId = role ? Number(role as string) : null;

        if (Number.isNaN(roleId))
            return ctx.messageUtil.replyWithError(
                message,
                `Provide a role`,
                `Provide a valid ID or mention of the role you want to set as a modmail ping role or pass \`remove\` to remove it.`
            );
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailPingRoleId: roleId } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            `Modmail ping role set`,
            stripIndents`
			Successfully ${roleId ? `set the modmail ping role to ${inlineCode(role)}` : "cleared the modmail ping role"}.${roleId ? `\n\n${unsetPingRole}` : ""}
		`
        );
    },
};

export default PingRole;
