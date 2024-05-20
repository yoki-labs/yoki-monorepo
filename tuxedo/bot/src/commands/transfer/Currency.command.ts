import { Currency } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { displayCurrencyAmount } from "../../util/text";
import { Category, Command } from "../commands";

export interface BalanceChange {
    currency: Currency;
    change: number;
}

const TransferCurrency: Command = {
    name: "transfer-currency",
    subName: "currency",
    description: "Transfers your currency to someone else.",
    category: Category.Balance,
    subCommand: true,
    args: [
        {
            name: "target",
            display: "target user",
            type: "member",
        },
        {
            name: "currency",
            display: "currency tag",
            type: "string",
        },
        {
            name: "amount",
            type: "number",
            min: 1,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const target = args.target as Member;
        const amount = args.amount as number;
        const currencyTag = args.currency as string;

        if (target.id === message.createdById) return ctx.messageUtil.replyWithError(message, "Can't transfer to yourself", `You cannot transfer items or currency to yourself.`);

        // Non-existant currency
        const currency = await ctx.dbUtil.getCurrency(server.serverId, currencyTag);
        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `Currency with the tag ${inlineCode(currencyTag)} does not exist.`);
        else if (!currency.transferRate)
            return ctx.messageUtil.replyWithError(
                message,
                "No transfer rate",
                `Currency with the tag ${inlineCode(currencyTag)} does not have transfer rate set and cannot be transferred.`
            );

        const executorInfo = await ctx.dbUtil.getServerMember(server.serverId, message.createdById);

        // Make sure they have enough
        const executorBalance = executorInfo?.balances.find((x) => x.currencyId === currency.id);
        const currencyBalance = executorBalance?.all ?? BigInt(currency.startingBalance ?? 0);
        if (currencyBalance < amount)
            return ctx.messageUtil.replyWithError(
                message,
                `Not enough currency`,
                `You only have ${displayCurrencyAmount(currency, currencyBalance)} and cannot transfer ${amount}.`
            );

        // Info of the person being given the currency
        const targetInfo = await ctx.dbUtil.getServerMember(server.serverId, target.id);
        const targetBalance = targetInfo?.balances.find((x) => x.currencyId === currency.id);
        const targetCurrency = targetBalance?.all ?? BigInt(currency.startingBalance ?? 0);

        const transferAmount = Math.floor(amount * currency.transferRate);
        // Balance too high
        if (currency.maximumBalance && targetCurrency + BigInt(transferAmount) > currency.maximumBalance)
            return ctx.messageUtil.replyWithError(
                message,
                `Too much currency`,
                `Giving ${displayCurrencyAmount(currency, amount)} would result in <@${target.id}> being over the currency limit by ${
                    targetCurrency + BigInt(amount) - BigInt(currency.maximumBalance)
                }.`,
                undefined,
                { isSilent: true }
            );

        await Promise.all([
            ctx.dbUtil.updateMemberBalance(message.serverId!, message.createdById, executorInfo, [
                {
                    currencyId: currency.id,
                    pocket: (executorBalance?.pocket ?? 0) - amount,
                    bank: executorBalance?.bank ?? currency.startingBalance ?? 0,
                },
            ]),
            ctx.dbUtil.updateMemberBalance(message.serverId!, target.id, targetInfo, [
                {
                    currencyId: currency.id,
                    pocket: (targetBalance?.pocket ?? 0) + transferAmount,
                    bank: targetBalance?.bank ?? currency.startingBalance ?? 0,
                },
            ]),
        ]);

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Currency transferred`,
            `You have successfully transfered ${displayCurrencyAmount(currency, amount)} to <@${target.id}>.`,
            undefined,
            { isSilent: true }
        );
    },
};

export default TransferCurrency;
