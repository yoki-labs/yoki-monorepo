import { inlineCode } from "@yokilabs/bot";

import { CachedMember, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Clear: Command = {
    name: "history-clear",
    subName: "clear",
    description: "Clear the history of the specified user.",
    // usage: "<target>",
    examples: ["R40Mp0Wd"],
    subCommand: true,
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
                targetId: target.user!.id,
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `History cleared`,
            `${inlineCode(count)} cases have been successfully removed from <@${target.user!.id}>'s history.`,
            undefined,
            { isSilent: true }
        );
    },
};

export default Clear;
