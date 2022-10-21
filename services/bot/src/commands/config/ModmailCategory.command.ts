import { RoleType } from "@prisma/client";

import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const ModmailCategory: Command = {
    name: "config-modmailcategory",
    description: "Set the category where new modmail channels are created.",
    subCommand: true,
    usage: "[newCategory]",
    examples: ["", "532372"],
    subName: "modmailcategory",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newCategory", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const newCategory = args.newCategory as string | null;

        // No argument passed? Give info instead
        if (!newCategory) {
            return commandCtx.server.modmailCategoryId
                ? ctx.messageUtil.replyWithInfo(
                    message,
                    "Modmail category",
                    `This server's modmail category has been set as category by the ID ${inlineCode(commandCtx.server.modmailCategoryId)}.`
                )
                : ctx.messageUtil.replyWithNullState(message, "No modmail category", "This server does not have modmail category set.");
        }

        let endValue: number | null = null;
        if (newCategory !== "null") {
            endValue = Number(newCategory);
            if (Number.isNaN(endValue)) return ctx.messageUtil.replyWithError(message, `Bad ID format`, `Category ID must be a number! Ensure you did not copy the name.`);
        }

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailCategoryId: endValue } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail category set`, `Successfully set the modmail category to ${inlineCode(newCategory)}`);
    },
};

export default ModmailCategory;
