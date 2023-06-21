import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Purge: Command = {
    name: "members-purge-balances",
    description: "Removes a currency from everyone's balances.",
    subName: "purge-balances",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "tag",
            display: "currency tag",
            type: "string",
            max: 16,
        },
        {
            name: "confirmation",
            type: "string",
            optional: true,
        }
    ],
    execute: async (message, args, ctx, { prefix }) => {
        const tag = (args.tag as string).toLowerCase();
        const confirmed = (args.confirmation as string | null)?.toLowerCase() === "confirm";

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        const count = await ctx.prisma.memberBalance.count({
            where: {
                currencyId: currency.id,
                serverId: message.serverId!,
            }
        });

        if (!count)
            return ctx.messageUtil.replyWithError(
                message,
                "No balances to purge",
                `This currency does not exist in any of the member's balances and cannot be purged.`
            );
        else if (!confirmed)
            return ctx.messageUtil.replyWithWarning(
                message,
                "Confirm purge",
                stripIndents`
                    Are you sure you want to delete currency ${inlineQuote(currency.tag)} from member's balances? ${inlineCode(count)} members hold this currency in their bank or pocket balances. If that is intended, redo the command with \`confirm\` at the end like so:
                    \`\`\`md
                    ${prefix}income purge ${tag} confirm
                    \`\`\`
                `
            );

        await ctx.prisma.memberBalance.deleteMany({
            where: {
                serverId: message.serverId!,
                currencyId: currency.id,
            }
        });

        return ctx.messageUtil.replyWithSuccess(message, "Currency from balances purged", `Currency ${inlineQuote(currency.tag)} was successfully purged from everyone's balances.`)
    },
};

export default Purge;
