import { Currency, DefaultIncomeType, MemberBalance, Reward, ServerMember } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Member, Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Category, Command } from "../commands";
import { defaultIncomes } from "./income-defaults";

const defaultConfig = defaultIncomes[DefaultIncomeType.ROB];
const [defaultAdditionalMax, defaultMin] = defaultConfig.reward;
const defaultFailChance = 0.5;
const defaultFailCut = 1;

export interface BalanceChange {
    currency: Currency;
    change: number;
}

const Rob: Command = {
    name: "rob",
    description: "Steals a certain amount of money from targeted user's pocket.",
    aliases: ["burglarize", "burgle", "steal", "r"],
    category: Category.Income,
    args: [
        {
            name: "target",
            display: "target user",
            type: "member",
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as Member;

        // Makes no sense to rob yourself
        if (target.id === message.createdById) return ctx.messageUtil.replyWithError(message, "Cannot rob yourself", `You cannot rob yourself as you own your own balance.`);

        const serverConfig = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).find((x) => x.incomeType === DefaultIncomeType.ROB);

        // Can't rob if it doesn't exist
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length)
            return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${serverConfig?.action ?? defaultConfig.action}.`);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.ROB);

        // Need to wait 24 hours or the configured time
        const localCooldown = serverConfig?.cooldownMs ?? defaultConfig.cooldown;

        if (lastUsed && Date.now() - lastUsed < localCooldown)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to use rob again.`);

        // For the cooldown
        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.ROB);

        const executorInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        // To make it balanced and require you to sacrifice your balance too
        if (!executorInfo?.balances.length)
            return ctx.messageUtil.replyWithError(message, `No balance to use`, `To make your robbery attempt successful, you need to have to have a balance.`);

        // Add random amounts of rewards that were configured or ones that are default
        const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = serverConfig?.rewards.length
            ? serverConfig.rewards
            : [{ currencyId: currencies[0].id, maxAmount: defaultAdditionalMax + defaultMin, minAmount: defaultMin }];

        const newBalance: BalanceChange[] = [];

        const targetInfo = await ctx.dbUtil.getServerMember(message.serverId!, target.id);

        // Starting balance only exists in banks, so you can't rob anything
        if (!(targetInfo?.balances.length && targetInfo.balances.some((x) => x.pocket)))
            return ctx.messageUtil.replyWithError(message, "Nothing to steal", `The member either has no balance at all or their entire balance is in the bank.`);

        // Loop for checking whether executor has enough balance and adding rewards; does it all
        for (const reward of rewards) {
            // The opposite could be done, but this means adding additional `continue` if reward for that currency
            // doesn't exist, yada yada
            const currency = currencies.find((x) => x.id === reward.currencyId)!;
            const existingBalance = executorInfo?.balances.find((x) => x.currencyId === reward.currencyId);

            // Balance changes
            const currentBalance = existingBalance?.all ?? currency.startingBalance ?? 0;
            const requiredBalance = reward.maxAmount * defaultFailCut;

            // To have a proper losing condition
            if (currentBalance < requiredBalance)
                return ctx.messageUtil.replyWithError(message, "Need more currency", `You need at least ${requiredBalance} ${currency.name} to rob someone.`);

            const targetBalance = targetInfo?.balances.find((x) => x.pocket)?.pocket;

            // No point in calculating the stuff
            if (!targetBalance) continue;

            const randomReward = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount) + reward.minAmount);

            // I don't like this
            const cappedReward = randomReward > targetBalance ? targetBalance : randomReward;
            const finalReward = currency.maximumBalance && cappedReward > currency.maximumBalance ? currency.maximumBalance : cappedReward;

            newBalance.push({ currency, change: finalReward });
        }

        // If it has failed
        if (defaultFailChance > Math.random()) return handleFailState(ctx, message, executorInfo, newBalance);

        return handleSuccessState(ctx, message, targetInfo!, executorInfo, newBalance);
    },
};

async function handleFailState(ctx: TuxoClient, message: Message, executorInfo: ServerMember & { balances: MemberBalance[] }, newBalance: BalanceChange[]) {
    await ctx.dbUtil.updateMemberBalance(
        message.serverId!,
        message.createdById,
        executorInfo,
        newBalance.map((x) => {
            const current = executorInfo.balances.find((y) => y.currencyId === x.currency.id);

            return {
                currencyId: x.currency.id,
                pocket: current?.pocket ?? 0,
                bank: (current?.bank ?? x.currency.startingBalance ?? 0) - x.change,
            };
        })
    );

    return ctx.messageUtil.replyWithWarning(message, "Robbery failed", `You were caught and you were fined ${createChangeList(newBalance)}.`);
}

async function handleSuccessState(
    ctx: TuxoClient,
    message: Message,
    targetInfo: ServerMember & { balances: MemberBalance[] },
    executorInfo: ServerMember & { balances: MemberBalance[] },
    newBalance: BalanceChange[]
) {
    await Promise.all([
        ctx.dbUtil.updateMemberBalance(
            message.serverId!,
            message.createdById,
            executorInfo,
            newBalance.map((x) => {
                const current = executorInfo?.balances.find((y) => y.currencyId === x.currency.id);

                return {
                    currencyId: x.currency.id,
                    pocket: (current?.pocket ?? 0) + x.change,
                    bank: current?.bank ?? x.currency.startingBalance ?? 0,
                };
            })
        ),
        ctx.dbUtil.updateMemberBalanceOnly(
            targetInfo,
            newBalance.map((x) => {
                const current = targetInfo.balances.find((y) => y.currencyId === x.currency.id)!;

                return {
                    currencyId: x.currency.id,
                    pocket: (current.pocket ?? 0) - x.change,
                    bank: current?.bank,
                };
            })
        ),
    ]);

    return ctx.messageUtil.replyWithSuccess(
        message,
        "Robbery was successful",
        `You stole ${createChangeList(newBalance)} from <@${targetInfo.userId}> (${inlineCode(targetInfo.userId)}).`
    );
}

// For messages
const createChangeList = (changes: BalanceChange[]) => changes.map((x) => `${x.change} ${x.currency.name}`).join(", ");

export default Rob;
