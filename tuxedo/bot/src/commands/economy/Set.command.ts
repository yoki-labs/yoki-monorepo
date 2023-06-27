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
        }
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

        // To not accidentally try creating new member info or remove everything they had in the bank,
        // despite only setting pocket
        const memberInfo = await ctx.dbUtil.getServerMember(message.serverId!, message.createdById);
        const currentBalance = memberInfo?.balances.find((x) => x.currencyId === currency.id);

        await ctx.dbUtil.updateMemberBalance(
            message.serverId!,
            member.id,
            memberInfo,
            [
                {
                    currencyId: currency.id,
                    pocket: balanceType?.resolved !== BalanceType.BANK ? amount : currentBalance?.pocket ?? 0,
                    bank: balanceType?.resolved !== BalanceType.POCKET ? amount : currentBalance?.bank ?? 0,
                }
            ]
        );

        const balanceTypeDisplay = balanceType?.resolved === BalanceType.ALL ? "entire" : balanceType?.resolved.toLowerCase() ?? "pocket";

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Balance set",
            `<@${member.id}> (${inlineCode(member.id)}) had ${currency.name} in their ${balanceTypeDisplay} balance successsfully changed to ${inlineCode(amount)} ${currency.name}.`
        )
    },
};

export default Set;
