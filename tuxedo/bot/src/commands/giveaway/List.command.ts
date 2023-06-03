import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Category, Command } from "../commands";
import { RoleType } from "@prisma/client";

// 20 -- Emote + 10 -- formatting and all + 17 -- giveaway ID + 50 -- giveaway text
const giveawayLineLength = 20 + 10 + 17 + 50;
const giveawayCountPerPage = Math.floor(2048 / giveawayLineLength);

const List: Command = {
    name: "giveaway-list",
    description: "Lists all server's on-going and ended giveaways.",
    subName: "list",
    subCommand: true,
    category: Category.Events,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "page",
            type: "number",
            optional: true
        }
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;

        const giveaways = await ctx.prisma.giveaway.findMany({ orderBy: { createdAt: "desc" }, where: { serverId: message.serverId! } });

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: "Giveaways",
            page,
            items: giveaways,
            itemsPerPage: giveawayCountPerPage,
            itemMapping: (giveaway) => `${giveaway.hasEnded ? ":red_circle:" : ":large_green_circle:"} [${inlineCode(giveaway.id)}] ${inlineQuote(giveaway.text, 50)}`,
        });
    },
};

export default List;
