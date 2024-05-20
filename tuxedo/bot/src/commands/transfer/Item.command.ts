import { Currency } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { Category, Command } from "../commands";

export interface BalanceChange {
    currency: Currency;
    change: number;
}

const TransferItem: Command = {
    name: "transfer-item",
    subName: "item",
    description: "Transfers your items to someone else.",
    category: Category.Balance,
    subCommand: true,
    args: [
        {
            name: "target",
            display: "target user",
            type: "member",
        },
        {
            name: "itemId",
            display: "item's inventory index",
            type: "number",
            min: 1,
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
        const itemId = args.itemId as number;

        if (target.id === message.createdById) return ctx.messageUtil.replyWithError(message, "Can't transfer to yourself", `You cannot transfer items or currency to yourself.`);

        // Non-existant currency
        const executorInfo = await ctx.dbUtil.getServerMember(server.serverId, message.createdById);

        const executorItem = executorInfo?.items[itemId - 1];
        if (!executorItem) return ctx.messageUtil.replyWithError(message, "No such item", `The item ${inlineCode(itemId)} does not exist in your inventory.`);

        const item = (await ctx.dbUtil.getItem(server.serverId, executorItem.itemId))!;

        // Make sure they have enough
        if (!item.canTransfer) return ctx.messageUtil.replyWithError(message, `Can't transfer`, `This item has not been set as transferrable.`);
        // Make sure they have enough
        else if (executorItem.amount < amount)
            return ctx.messageUtil.replyWithError(message, `Not enough items`, `You only have ${executorItem.amount} amount of ${inlineQuote(item.name)}.`);

        // Info of the person being given the currency
        const targetInfo = await ctx.dbUtil.getServerMember(server.serverId, target.id);
        const targetItem = targetInfo?.items.find((x) => x.itemId === item.id);

        await Promise.all([
            ctx.dbUtil.updateServerMember(message.serverId!, message.createdById, executorInfo, [], {
                itemId: item.id,
                amount: (executorItem?.amount ?? 0) - amount,
            }),
            ctx.dbUtil.updateServerMember(message.serverId!, target.id, targetInfo, [], {
                itemId: item.id,
                amount: (targetItem?.amount ?? 0) + amount,
            }),
        ]);

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Item transferred`,
            `You have successfully transfered ${amount} of ${inlineQuote(item.id)} to <@${target.id}>.`,
            undefined,
            { isSilent: true }
        );
    },
};

export default TransferItem;
