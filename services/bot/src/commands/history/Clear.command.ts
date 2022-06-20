import { inlineCode } from "../../formatters";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Clear: Command = {
    name: "history-clear",
    subName: "clear",
    description: "Get the history of a user.",
    usage: "<targetId>",
    examples: ["R40Mp0Wd"],
    subCommand: true,
    aliases: ["purge", "c"],
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "member",
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;

        const { count } = await ctx.prisma.action.deleteMany({
            where: {
                serverId: message.serverId!,
                targetId: target.user.id,
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `History cleared`,
            `${inlineCode(count)} cases have been successfully removed from <@${target.user.id}>'s history.`,
            undefined,
            { isSilent: true }
        );
    },
};

export default Clear;
