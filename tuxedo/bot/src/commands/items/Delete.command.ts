import { RoleType } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { Category, Command } from "../commands";

const Delete: Command = {
    name: "items-delete",
    description: "Deletes an existing item.",
    subName: "delete",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "id",
            display: "item ID",
            type: "string",
        },
        {
            name: "confirmation",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { prefix }) => {
        const id = args.id as string;
        const confirmed = (args.confirmation as string | undefined)?.toLowerCase() === "confirm";

        const item = await ctx.dbUtil.getItem(message.serverId!, id);

        // Item needs to exist for it to be deleted
        if (!item) return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Item with ID ${inlineQuote(id)} does not exist and cannot be deleted.`);

        // To show how many people have that item in their inventory
        const itemInInventoryCount = await ctx.prisma.memberItem.count({
            where: {
                serverId: message.serverId!,
                itemId: id,
            },
        });

        if (itemInInventoryCount && !confirmed)
            return ctx.messageUtil.replyWithWarning(
                message,
                "Confirm deletion",
                stripIndents`
                    Are you sure you want to delete item ${inlineQuote(item.name)}? This will also delete the item from inventories of ${inlineCode(
                    itemInInventoryCount
                )} members. If that is intended, redo the command with \`confirm\` at the end like so:
                    \`\`\`md
                    ${prefix}item delete ${id} confirm
                    \`\`\`
                `
            );

        await ctx.dbUtil.deleteItem(item);

        return ctx.messageUtil.replyWithSuccess(message, "Item deleted", `Item with name ${inlineQuote(item.name)} has been successfully deleted.`);
    },
};

export default Delete;
