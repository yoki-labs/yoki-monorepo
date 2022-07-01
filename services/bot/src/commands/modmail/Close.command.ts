import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Close: Command = {
    name: "modmail-close",
    subName: "close",
    description: "Close a modmail thread",
    examples: [""],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    execute: async (message, _args, ctx) => {
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, "This channel is not a modmail channel!");
        await ctx.prisma.modmailThread.update({ where: { id: isCurrentChannelModmail.id }, data: { closed: true } });
        return ctx.rest.router.deleteChannel(message.channelId);
    },
};

export default Close;
