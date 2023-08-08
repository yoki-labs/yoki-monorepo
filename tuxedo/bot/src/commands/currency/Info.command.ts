import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { formatDate } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import { TAG_REGEX } from "../../util/matching";
import { Category, Command } from "../commands";

const Info: Command = {
    name: "currency-info",
    description: "Provides information about server's currency.",
    subName: "info",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "tag",
            type: "string",
            max: 16,
        },
    ],
    execute: async (message, args, ctx, { server: { timezone } }) => {
        const tag = (args.tag as string).toLowerCase();

        if (!TAG_REGEX.test(tag))
            return ctx.messageUtil.replyWithError(
                message,
                "Incorrect format",
                "The format of the currency's tag has incorrect symbols. Only letters part of English alphabet, numbers, `-` and `_` are allowed."
            );

        const currency = await ctx.dbUtil.getCurrency(message.serverId!, tag);

        if (!currency) return ctx.messageUtil.replyWithError(message, "No such currency", `There is no currency with tag ${inlineQuote(tag)} in this server.`);

        return ctx.messageUtil.replyWithInfo(
            message,
            `:${currency.emote}: ${currency.name} (${inlineCode(tag)})`,
            `Info about server's local currency with the tag ${inlineCode(tag)} ${currency.createdBy ? `created by <@${currency.createdBy}>` : "that has been auto-generated"}.`,
            {
                fields: [
                    {
                        name: "Balance Config",
                        value: stripIndents`
                            **Maximum balance:** ${currency.maximumBalance ? `${currency.maximumBalance} ${currency.name}` : "None"}
                            **Starting balance:** ${currency.startingBalance ?? 0} ${currency.name}
                        `,
                    },
                    {
                        name: "Additional Info",
                        value: stripIndents`
                            **Currency created:** ${formatDate(currency.createdAt, timezone)}
                        `,
                    },
                ],
            },
            {
                isSilent: true,
            }
        );
    },
};

export default Info;
