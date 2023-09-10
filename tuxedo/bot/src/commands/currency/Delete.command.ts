import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Delete: Command = {
    name: "currency-delete",
    description: "Deletes an existing currency.",
    subName: "delete",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "tag",
            type: "string",
            max: 16,
        },
        {
            name: "confirmation",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { prefix }) => {
        const tag = (args.tag as string).toLowerCase();
        const confirmed = (args.confirmation as string | undefined)?.toLowerCase() === "confirm";

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        // Currency needs to exist for it to be deleted
        if (!currency) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Currency with tag ${inlineQuote(tag)} does not exist and cannot be deleted.`);

        // To show how many people have that currency in their balance
        const balanceCount = await ctx.prisma.memberBalance.count({
            where: {
                serverId: message.serverId!,
                currencyId: currency.id,
            },
        });

        if (balanceCount && !confirmed)
            return ctx.messageUtil.replyWithWarning(
                message,
                "Confirm deletion",
                stripIndents`
                    Are you sure you want to delete currency ${inlineQuote(currency.name)}? This will also delete the currency from balances of ${inlineCode(
                    balanceCount
                )} members, as well as rewards of this currency in income commands and currency in item prices. If that is intended, redo the command with \`confirm\` at the end like so:
                    \`\`\`md
                    ${prefix}currency delete ${tag} confirm
                    \`\`\`
                `
            );

        await ctx.dbUtil.deleteCurrency(currency);

        return ctx.messageUtil.replyWithSuccess(message, "Currency deleted", `Currency with tag ${inlineQuote(tag)} has been successfully deleted.`);
    },
};

export default Delete;
