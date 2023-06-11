import { Category, Command } from "../commands";

const Leaderboard: Command = {
    name: "leaderboard",
    description: "Shows the top locally richest people in the server.",
    aliases: ["leader", "lb"],
    category: Category.Income,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length)
            return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any currencies to show leaderboard of.`);

        // Something to display for now
        const mainCurrency = currencies[0];

        const balances = await ctx.prisma.memberBalance.findMany({
            orderBy: { all: "desc" },
            include: {
                member: true
            },
            where: {
                serverId: message.serverId!,
                currencyId: mainCurrency.id
            },
        });

        const start = page * 10 + 1;

        console.log("Member count", balances.length, "of server", JSON.stringify(message.serverId));

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: ":trophy: Server Leaderboard",
            items: balances,
            itemsPerPage: 10,
            itemMapping: (balance, i) =>
                `${start + i}. <@${balance.member.userId}> — ${balance.all} ${mainCurrency.name}`,
            page,
            message: {
                isSilent: true,
            },
        });
    },
};

export default Leaderboard;
