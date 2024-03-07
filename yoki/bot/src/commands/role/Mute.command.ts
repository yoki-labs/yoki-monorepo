import { stripIndents } from "common-tags";
import { Role } from "guilded.js";

import { RoleType } from "../../typings";
import { addOrRemoveMuteRoleMessage } from "../../utils/util";
import { Category, Command } from "../commands";

const Mute: Command = {
    name: "role-mute",
    description: "Set the role given when user is muted.",
    // usage: "[role mention or ID/remove]",
    examples: ["@muted", "12345678", "@muted remove"],
    category: Category.Settings,
    subCommand: true,
    subName: "mute",
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
            const muteRole = commandCtx.server.muteRoleId;

            return muteRole
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      `Mute role`,
                      stripIndents`
                    The mute role is set to role <@${muteRole}>.

                    ${addOrRemoveMuteRoleMessage(commandCtx.server.getPrefix())}
                `,
                      undefined,
                      { isSilent: true }
                  )
                : ctx.messageUtil.replyWithNullState(message, `No mute role`, `There is no mute role set.`);
        }

        if (remove?.toUpperCase() === "REMOVE") {
            // The ability to delete mute roles
            await ctx.prisma.server.updateMany({ data: { muteRoleId: null }, where: { serverId: message.serverId! } });

            return ctx.messageUtil.replyWithSuccess(message, `Mute role removed`, `<@${commandCtx.server.muteRoleId}> is no longer the mute role.`, undefined, { isSilent: true });
        }

        // This could be merged back with `if (!role)`, but I am too lazy to handle it well with
        // `REMOVE` + it is better to tell someone they are wrong than just make them confused
        if (Number.isNaN(role.id))
            return ctx.messageUtil.replyWithError(message, `Provide role`, `Provide the mention or ID of the role you want to set as a mute role or pass \`remove\` to remove it.`);

        await ctx.prisma.server.updateMany({ data: { muteRoleId: role.id }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Mute role set`, `Successfully set <@${role.id}> as the mute role`, undefined, { isSilent: true });
    },
};

export default Mute;
