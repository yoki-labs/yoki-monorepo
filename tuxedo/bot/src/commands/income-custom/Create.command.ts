import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { getUnavailableIncomeNames, nameRegex } from "./income-util";
import { inlineQuote } from "@yokilabs/bot";

const MAX_CUSTOM_INCOMES = 10;

const Create: Command = {
    name: "income-create",
    description: "Allows you to create a custom income command.",
    subName: "create",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "name",
            display: "income command name",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const name = (args.name as string).toLowerCase();

        const disallowedNames = getUnavailableIncomeNames(ctx);

        // To not interfere with Tuxo's stuff
        if (disallowedNames.includes(name))
            return ctx.messageUtil.replyWithError(
                message,
                "Cannot use that name",
                `The name ${inlineQuote(name)} is used by one of the Tuxo's commands.`
            );

        if (!nameRegex.test(name))
            return ctx.messageUtil.replyWithError(
                message,
                "Bad name format",
                `The name ${inlineQuote(name)} can only consist of letters, digits, \`-\` and \`_\`.`
            );

        const incomeCommands = await ctx.dbUtil.getIncomeOverrides(message.serverId!);

        // To check if it exists already
        if (incomeCommands.find((x) => x.name === name))
            return ctx.messageUtil.replyWithError(
                message,
                "Already exists",
                `Income by the name of ${inlineQuote(name)} already exists.`
            );
        // Or if the count is too high
        else if (incomeCommands.length > MAX_CUSTOM_INCOMES)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many incomes",
                `You cannot create more than ${MAX_CUSTOM_INCOMES} income commands.`
            );

        await ctx.prisma.incomeCommand.create({
            data: {
                serverId: message.serverId!,
                name,
                createdBy: message.createdById,
            }
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "Income created",
            `Income command ${inlineQuote(name)} has been successfully created.`
        );
    },
};

export default Create;
