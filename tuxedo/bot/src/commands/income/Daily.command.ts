import ms from "ms";

import { Category, Command } from "../commands";

const dailyCooldown = 24 * 60 * 60 * 1000;

const Daily: Command = {
    name: "daily",
    description: "Gets daily reward.",
    aliases: ["day", "d"],
    category: Category.Income,
    execute: async (message, _args, ctx) => {
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length) return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies to get daily reward.`);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, "daily");

        // Need to wait 24 hours
        if (lastUsed && Date.now() - lastUsed < dailyCooldown)
            return ctx.messageUtil.replyWithError(
                message,
                "Too fast",
                `You have to wait ${ms(lastUsed + dailyCooldown - Date.now(), { long: true })} to get your daily reward again.`
            );

        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, "daily");

        // FIXME: Temporary solution for no config
        const reward = Math.floor(Math.random() * 250 + 50);

        // Add to every currency
        const balanceAdded = {};
        for (const currency of currencies) balanceAdded[currency.id] = reward;

        await ctx.dbUtil.updateServerMemberBalance(message.serverId!, message.createdById, balanceAdded, currencies);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(message, `Daily reward claimed`, `You have found a present, which had ${currencies.map((x) => `${reward} ${x.name}`).join(", ")}.`);
    },
};

export default Daily;
