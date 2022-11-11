import { stripIndents } from "common-tags";
import { RoleType } from "../../typings";
import { addOrRemoveMuteRoleMessage } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Mute: Command = {
    name: "role-mute",
    description: "Set or view the mute role for this server.",
    usage: "[role ID/remove]",
    examples: ["12345678", ""],
    category: Category.Settings,
    subCommand: true,
    subName: "mute",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "role", optional: true, type: "string" }],
    execute: async (message, args, ctx, commandCtx) => {
        const role = args.role as string | undefined;

        // Just display if it's unspecified
        if (!role) {
            const muteRole = commandCtx.server.muteRoleId;

            return muteRole
                ? ctx.messageUtil.replyWithInfo(message, `Mute role`, stripIndents`
                    The mute role is set to role <@${muteRole}>.

                    ${addOrRemoveMuteRoleMessage(commandCtx.server.getPrefix())}
                `, undefined, { isSilent: true })
                : ctx.messageUtil.replyWithNullState(message, `No mute role`, `There is no mute role set.`);
        } else if (role.toUpperCase() === "REMOVE") {
            // The ability to delete mute roles
            await ctx.prisma.server.updateMany({ data: { muteRoleId: null }, where: { serverId: message.serverId } });

            return ctx.messageUtil.replyWithSuccess(message, `Mute role removed`, `<@${commandCtx.server.muteRoleId}> is no longer a mute role.`, undefined, { isSilent: true });
        }

        const roleId = role ? Number(role as string) : null;

        // This could be merged back with `if (!role)`, but I am too lazy to handle it well with
        // `REMOVE` + it is better to tell someone they are wrong than just make them confused
        if (Number.isNaN(roleId))
            return ctx.messageUtil.replyWithError(message, `Provide role ID`, `Provide the ID of the role you want to set as a mute role or pass \`remove\` to remove it.`);

        await ctx.prisma.server.updateMany({ data: { muteRoleId: roleId }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Mute role set`, `Successfully set <@${roleId}> as the mute role`, undefined, { isSilent: true });
    },
};

export default Mute;
