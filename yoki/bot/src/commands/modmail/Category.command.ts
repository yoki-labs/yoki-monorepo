import { RoleType } from "@prisma/client";

import { inlineCode } from "../../utils/formatters";
import { isInputRemoveSetting } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const ModmailCategory: Command = {
    name: "modmail-category",
    description: "Set the category where new modmail channels are created.",
    subCommand: true,
    usage: "[ID of the new category]",
    examples: ["", "532372"],
    subName: "category",
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

		const endValue: number | null = isInputRemoveSetting(newCategory) ? null : Number(newCategory);
		if(Number.isNaN(endValue)) return ctx.messageUtil.replyWithError(message, "Invalid category ID", "Category ID must be a valid number.")

		if(endValue) {
			try {
				const createdChannel = await ctx.rest.router.createChannel({ "name": "PLACEHOLDER-MODMAIL-CHANNEL", type: "chat", serverId: message.serverId!, categoryId: endValue, groupId: commandCtx.server.modmailGroupId ?? undefined})
				await ctx.rest.router.deleteChannel(createdChannel.channel.id);
			} catch(e) {
				return ctx.messageUtil.replyWithError(message, "Error setting category!", `This category either doesn't exist in ${commandCtx.server.modmailGroupId ? "the previously set group" : "this group"} or the bot does not the permissions to create/delete channels in it.`)
			}
		}
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailCategoryId: endValue } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail category set`, `Successfully set the modmail category to ${inlineCode(newCategory)}`);
    },
};

export default ModmailCategory;
