import { RoleType } from "@prisma/client";
import { inlineQuote } from "@yokilabs/bot";
import { createServerLimit } from "@yokilabs/bot/src/premium";

import { Category, Command } from "../commands";
import { getUnavailableIncomeNames, nameRegex } from "./income-util";

const getServerLimit = createServerLimit({
    Gold: 50,
    Silver: 30,
    Copper: 20,
    Early: 15,
    Default: 10,
});

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
    execute: async (message, args, ctx, { server }) => {
        const name = (args.name as string).toLowerCase();

        const disallowedNames = getUnavailableIncomeNames(ctx);

        // To not interfere with Tuxo's stuff
        if (disallowedNames.includes(name))
            return ctx.messageUtil.replyWithError(message, "Cannot use that name", `The name ${inlineQuote(name)} is used by one of the Tuxo's commands.`);

        if (!nameRegex.test(name))
            return ctx.messageUtil.replyWithError(message, "Bad name format", `The name ${inlineQuote(name)} can only consist of letters, digits, \`-\` and \`_\`.`);

        const incomeCommands = await ctx.dbUtil.getIncomeOverrides(message.serverId!);

        // To check if it exists already
        if (incomeCommands.find((x) => x.name === name))
            return ctx.messageUtil.replyWithError(message, "Already exists", `The income by the name of ${inlineQuote(name)} already exists.`);

        // To not create too many of them for DB to blow up
        const serverLimit = getServerLimit(server);

        if (incomeCommands.length >= serverLimit)
            return ctx.messageUtil.replyWithError(
                message,
                "Too many currencies",
                `You can only have ${serverLimit} currencies per server.${server.premium ? "" : "\n\n**Note:** You can upgrade to premium to increase the limit."}`
            );

        await ctx.prisma.incomeCommand.create({
            data: {
                serverId: message.serverId!,
                name,
                createdBy: message.createdById,
            },
        });

        return ctx.messageUtil.replyWithSuccess(message, "Income created", `The income command ${inlineQuote(name)} has been successfully created.`);
    },
};

export default Create;
