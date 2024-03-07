import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Close: Command = {
    name: "close",
    subName: "close",
    description: "Close the current or specified user's modmail ticket.",
    examples: [""],
    subCommand: true,
    forceShow: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Modmail,
    args: [
        {
            name: "userId",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const userId = args.userId as string | null;

        const ticket = userId
            ? await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId!, openerId: userId, closed: false } })
            : await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId!, modFacingChannelId: message.channelId, closed: false } });
        if (!ticket)
            return userId
                ? ctx.messageUtil.replyWithError(message, "No open modmail ticket for user", "User does not have an open modmail ticket")
                : ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        await ctx.supportUtil.closeExistingThread(server, ticket, message.authorId);

        if (ticket.modFacingChannelId === ticket.userFacingChannelId) await ctx.rest.put(`/channels/${ticket.modFacingChannelId}/archive`);
        else await ctx.channels.delete(message.channelId);

        return ctx.supportUtil.sendModmailCloseMessage(server, ticket, "closed by a staff member");
    },
};

export default Close;
