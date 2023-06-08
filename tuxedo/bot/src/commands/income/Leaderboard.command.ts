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
        const members = await ctx.prisma.serverMember.findMany({
            orderBy: [{ bankBalance: "desc" }, { balance: "desc" }],
            where: {
                serverId: message.serverId!,
            },
        });

        // Something to display for now
        const mainCurrency = currencies[0];

        const start = page * 10 + 1;

        console.log("Member count", members.length, "of server", JSON.stringify(message.serverId));

        return ctx.messageUtil.replyWithPaginatedContent({
            replyTo: message,
            title: ":trophy: Server Leaderboard",
            items: members,
            itemsPerPage: 10,
            itemMapping: (user, i) =>
                `${start + i}. <@${user.userId}> — ${(user.balance?.[mainCurrency.id] ?? 0) + (user.bankBalance?.[mainCurrency.id] ?? 0)} ${mainCurrency.name}`,
            page,
            message: {
                isSilent: true,
            },
        });
    },
};

export default Leaderboard;
