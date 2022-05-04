import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Muterole: Command = {
    name: "config-muterole",
    description: "Set or view the mute role for this server.",
    usage: "[newRole]",
    category: Category.Settings,
    subCommand: true,
    subName: "muterole",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newRole", optional: true, type: "string" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newRole = args.newRole ? Number(args.newRole as string) : null;
        // if (newChannel && !isUUID(newChannel)) return ctx.messageUtil.send(message.channelId, "Oh no! That is not a valid role ID.");

        if (!newRole) {
            const muteRole = commandCtx.server.muteRoleId;
            return ctx.messageUtil.send(message.channelId, muteRole ? `The mute role is set to: \`${muteRole}\`` : `There is no mute role set.`);
        }

        await ctx.prisma.server.updateMany({ data: { muteRoleId: newRole }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.send(message.channelId, `Successfully set the mute role to \`${newRole}\``);
    },
};

export default Muterole;
