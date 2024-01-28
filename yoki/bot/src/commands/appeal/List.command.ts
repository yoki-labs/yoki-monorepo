import { Appeal } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

// ID -- 17; Text -- 9; User ID -- 12; Max content -- 100; Content ellipse -- 3
const maxContent = 35;
const maxAppeal = 17 + 9 + 3 + 12 + maxContent;
// How many cases to show per page
const maxAppeals = Math.floor(2048 / maxAppeal);

const List: Command = {
    name: "appeal-list",
    subName: "list",
    description: "Gets the list of all ban appeals in this server.",
    // usage: "[page]",
    examples: ["", "2"],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;

        // -1, -2, etc.
        if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);

        const appeals = await ctx.prisma.appeal.findMany({
            where: {
                serverId: message.serverId!,
            },
        });

        return ctx.messageUtil.replyWithPaginatedContent<Appeal>({
            replyTo: message,
            items: appeals,
            title: `Appeals`,
            itemMapping: (x) => {
                const trimmedContent = x.content.length > maxContent ? `${x.content.substring(0, maxContent).split("\n").join(" ")}...` : x.content.split("\n").join(" ");

                return `[${inlineCode(x.id)}] <@${x.creatorId}> ${trimmedContent}`;
            },
            itemsPerPage: maxAppeals,
            page,
            message: {
                isSilent: true,
            },
        });
    },
};

export default List;
