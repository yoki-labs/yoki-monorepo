import { Currency, DefaultIncomeType, MemberBalance, ModuleName, Reward, ServerMember } from "@prisma/client";
import { Member, Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { displayCurrencyAmountInline } from "../../util/text";
import { Category, Command } from "../commands";
import { defaultIncomes } from "./income-defaults";

const defaultConfig = defaultIncomes[DefaultIncomeType.ROB];
const [defaultMin, defaultAdditionalMax] = defaultConfig.reward;

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
    execute: async (message, args, ctx, { server }) => {
        // Allow one kill switch to shut all of it down if necessary without any additional hassle
        if (server.modulesDisabled.includes(ModuleName.ECONOMY))
            return ctx.messageUtil.replyWithError(message, "Economy module disabled", `Economy module has been disabled and this command cannot be used.`);

        const target = args.target as Member;

        // Makes no sense to rob yourself
        if (target.id === message.createdById) return ctx.messageUtil.replyWithError(message, "Cannot rob yourself", `You cannot rob yourself as you own your own balance.`);

        const serverConfig = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).find((x) => x.incomeType === DefaultIncomeType.ROB);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.ROB);
        // Need to wait 24 hours or the configured time
        const localCooldown = serverConfig?.cooldownMs ?? defaultConfig.cooldown;

        if (lastUsed && Date.now() - lastUsed < localCooldown)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + localCooldown - Date.now(), { long: true })} to use rob again.`);

        // Can't rob if it doesn't exist
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length)
            return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${serverConfig?.action ?? defaultConfig.action}.`);

        const executorInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);

        // To make it balanced and require you to sacrifice your balance too
        if (!executorInfo?.balances.length)
            return ctx.messageUtil.replyWithError(message, `No balance to use`, `To make your robbery attempt successful, you need to have to have a balance.`);

        const targetInfo = await ctx.dbUtil.getServerMember(message.serverId!, target.id);

        // Starting balance only exists in banks, so you can't rob anything
        if (!(targetInfo?.balances.length && targetInfo.balances.some((x) => x.pocket > 0)))
            return ctx.messageUtil.replyWithError(message, "Nothing to steal", `The member either has no balance at all or their entire balance is in the bank.`);

        // Add random amounts of rewards that were configured or ones that are default
        const rewards: Pick<Reward, "currencyId" | "minAmount" | "maxAmount">[] = serverConfig?.rewards.length
            ? serverConfig.rewards
            : [{ currencyId: currencies[0].id, maxAmount: defaultAdditionalMax + defaultMin, minAmount: defaultMin }];

        const newBalance: BalanceChange[] = [];

        // Loop for checking whether executor has enough balance and adding rewards; does it all
        for (const reward of rewards) {
            // ---- Check user's balance requirements ----
            // The opposite could be done, but this means adding additional `continue` if reward for that currency
            // doesn't exist, yada yada
            const currency = currencies.find((x) => x.id === reward.currencyId)!;
            const existingBalance = executorInfo?.balances.find((x) => x.currencyId === reward.currencyId);

            // Balance changes
            const currentBalance = existingBalance?.all ?? currency.startingBalance ?? 0;
            const requiredBalance = reward.maxAmount * (serverConfig?.failSubtractCut ?? defaultConfig.failCut!);

            // To have a proper losing condition
            if (currentBalance < requiredBalance)
                return ctx.messageUtil.replyWithError(message, "Need more currency", `You need at least ${requiredBalance} ${currency.name} to rob someone.`);

            // ---- Check target's balance requirements ----
            const targetBalance = targetInfo.balances.find((x) => x.currencyId === reward.currencyId)?.pocket;

            // No point in calculating the stuff; shouldn't be able to steal negative currency either
            if (!targetBalance || targetBalance < 1) continue;

            const randomReward = Math.floor(Math.random() * (reward.maxAmount - reward.minAmount) + reward.minAmount);

            // I don't like this
            const cappedReward = randomReward > targetBalance ? targetBalance : randomReward;
            const finalReward = currency.maximumBalance && cappedReward > currency.maximumBalance ? currency.maximumBalance : cappedReward;

            newBalance.push({ currency, change: finalReward });
        }

        // Failed to steal anything
        if (!newBalance.length) return ctx.messageUtil.replyWithError(message, "Nothing to steal", `The member has no balance that you can steal at all or it's in the negatives.`);

        // For the cooldown
        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, DefaultIncomeType.ROB);

        // If it has failed
        if ((serverConfig?.failChance ?? defaultConfig.failChance!) > Math.random())
            return handleFailState(ctx, message, executorInfo, serverConfig?.failSubtractCut ?? defaultConfig.failCut!, newBalance);

        return handleSuccessState(ctx, message, target, targetInfo!, executorInfo, newBalance);
    },
};

async function handleFailState(ctx: TuxoClient, message: Message, executorInfo: ServerMember & { balances: MemberBalance[] }, failCut: number, newBalance: BalanceChange[]) {
    await ctx.dbUtil.updateMemberBalance(
        message.serverId!,
        message.createdById,
        executorInfo,
        newBalance.map((x) => {
            const current = executorInfo.balances.find((y) => y.currencyId === x.currency.id);

            return {
                currencyId: x.currency.id,
                pocket: current?.pocket ?? 0,
                bank: (current?.bank ?? x.currency.startingBalance ?? 0) - Math.floor(x.change * failCut),
            };
        })
    );

    return ctx.messageUtil.replyWithWarningInline(
        message,
        `You were caught trying to pickpocket and you were fined ${newBalance.map((x) => displayCurrencyAmountInline(x.currency, x.change)).join(", ")}.`
    );
}

async function handleSuccessState(
    ctx: TuxoClient,
    message: Message,
    target: Member,
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

    return ctx.messageUtil.replyWithSuccessInline(
        message,
        `You pickpocketed <@${target.id}> (\`${target.id}\`) and stole ${newBalance.map((x) => displayCurrencyAmountInline(x.currency, x.change)).join(", ")} from them.`
    );
}

export default Rob;
