import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Muterole: Command = {
    name: "config-muterole",
    description: "Set or view the mute role for this server.",
    usage: "[newRole]",
    examples: ["12345678", ""],
    category: Category.Settings,
    subCommand: true,
    subName: "muterole",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newRole", optional: true, type: "string" }],
    execute: async (message, args, ctx, commandCtx) => {
        const newRole = args.newRole ? Number(args.newRole as string) : null;

        if (!newRole) {
            const muteRole = commandCtx.server.muteRoleId;
            return muteRole
                ? ctx.messageUtil.replyWithContent(message, `Mute role`, `The mute role is set to role \`${muteRole}\`.`)
                : ctx.messageUtil.replyWithNullState(message, `No mute role`, `There is no mute role set.`);
        }

        await ctx.prisma.server.updateMany({ data: { muteRoleId: newRole }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.replyWithSuccess(message, `Mute role set`, `Successfully set \`${newRole}\` as the mute role`);
    },
};

export default Muterole;
