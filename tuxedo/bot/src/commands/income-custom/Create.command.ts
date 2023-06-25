import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { getUnavailableIncomeNames, nameRegex } from "./income-util";
import { inlineQuote } from "@yokilabs/bot";

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

        // To check if it exists already
        if (await ctx.prisma.incomeCommand.findFirst({ where: { serverId: message.serverId!, name } }))
            return ctx.messageUtil.replyWithError(
                message,
                "Already exists",
                `Income by the name of ${inlineQuote(name)} already exists.`
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
