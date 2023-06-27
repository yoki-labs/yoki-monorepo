import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Member } from "guilded.js";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";
import { BalanceType } from "./income-management";

const Set: Command = {
    name: "members-set-balance",
    description: "Sets member's balance.",
    subName: "set-balance",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "member",
            type: "member",
        },
        {
            name: "tag",
            display: "currency tag",
            type: "string",
            max: 16,
        },
        {
            name: "amount",
            type: "number",
        },
        {
            name: "balanceType",
            display: "pocket | bank | all",
            type: "enum",
            values: BalanceType,
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const member = args.member as Member;
        const tag = (args.tag as string).toLowerCase();
        const amount = Math.floor(args.amount as number);
        const balanceType = args.balanceType as { resolved: BalanceType; original: string } | null;

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        const pocketBalance = balanceType?.resolved !== BalanceType.BANK ? { [currency.id]: amount } : {};
        const bankBalance = !balanceType || balanceType?.resolved === BalanceType.POCKET ? {} : { [currency.id]: amount };

        await ctx.dbUtil.setMemberBalance(message.serverId!, member.id, pocketBalance, bankBalance);

        const balanceTypeDisplay = balanceType?.resolved === BalanceType.ALL ? "entire" : balanceType?.resolved.toLowerCase() ?? "pocket";

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Balance set",
            `<@${member.id}> (${inlineCode(member.id)}) had ${currency.name} in their ${balanceTypeDisplay} balance successsfully changed to ${inlineCode(amount)} ${
                currency.name
            }.`
        );
    },
};

export default Set;
