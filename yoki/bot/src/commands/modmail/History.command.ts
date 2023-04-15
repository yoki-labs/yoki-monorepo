import type { ModmailThread } from "@prisma/client";
import { inlineCode } from "@yokilabs/util";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const History: Command = {
    name: "modmail-history",
    subName: "history",
    description: "View the modmail history for a user.",
    usage: "<userId>",
    examples: ["0mqNyllA"],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Modmail,
    args: [
        {
            name: "userId",
            type: "string",
        },
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const userId = args.userId as string;
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;

        const threads = await ctx.prisma.modmailThread.findMany({
            where: {
                serverId: message.serverId!,
                openerId: userId,
            },
        });

        // -1, -2, etc.
        if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);
        if (!threads.length) return ctx.messageUtil.replyWithNullState(message, `No threads`, `This user does not have any modmail history associated with them.`);
        return ctx.messageUtil.replyWithPaginatedContent<ModmailThread>({
            replyTo: message,
            items: threads,
            title: `<@${userId}>'s History`,
            itemMapping: (x) => inlineCode(x.id),
            itemsPerPage: 10,
            page,
            message: { isSilent: true },
        });
    },
};

export default History;
