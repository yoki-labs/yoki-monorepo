import type { Command } from "../Command";

const Muterole: Command = {
    name: "config-muterole",
    description: "Set or view the mute role for this server.",
    usage: "muterole [newRole]",
    subCommand: true,
    subName: "muterole",
    args: [{ name: "newRole", optional: true, type: "string" }],
    execute: async (message, args, ctx) => {
        const newRole = args.newRole ? Number(args.newRole as string) : null;
        // if (newChannel && !isUUID(newChannel)) return ctx.messageUtil.send(message.channelId, "Oh no! That is not a valid channel ID.");

        if (!newRole) {
            const muteRole = await ctx.serverUtil.getMuteRole(message.serverId!);
            return ctx.messageUtil.send(
                message.channelId,
                muteRole ? `The mute role is set to: \`${muteRole.muteRoleId}\`` : `There is no mute role channel set.`
            );
        }

        await ctx.prisma.server.updateMany({ data: { muteRoleId: newRole }, where: { serverId: message.serverId! } });
        return ctx.messageUtil.send(message.channelId, `Successfully set the mute role to \`${newRole}\``);
    },
};

export default Muterole;
