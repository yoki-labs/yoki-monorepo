import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote, summarizeRolesOrUsers } from "@yokilabs/bot";
import { formatDate } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import { Category, Command } from "../commands";

import { displayItemValues } from "./item-values";
const Info: Command = {
    name: "items-info",
    description: "Provides information about server's currency.",
    subName: "info",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "id",
            display: "item ID",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server: { timezone } }) => {
        const id = args.id as string;

        const item = await ctx.dbUtil.getItem(message.serverId!, id);

        // Item needs to exist for it to be deleted
        if (!item)
            return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Item with ID ${inlineQuote(id)} does not exist.`);

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        return ctx.messageUtil.replyWithInfo(
            message,
            `${item.name} (${inlineCode(item.id)})`,
            `Info about server's local item with the ID ${inlineCode(item.id)} created by <@${item.createdBy}>.`,
            {
                fields: [
                    {
                        name: "Given Roles",
                        value: item.givesRoles.length ? summarizeRolesOrUsers(item.givesRoles) : "No roles are given by this item.",
                    },
                    {
                        name: "Price",
                        value: item.value.length ? displayItemValues(item.value, currencies) : "Item has no value and is free.",
                    },
                    {
                        name: "Additional Info",
                        value: stripIndents`
                            ${item.canBuy ? ":dollar: **Can be bought.**" : ""}
                            **Item created:** ${formatDate(item.createdAt, timezone)}
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
