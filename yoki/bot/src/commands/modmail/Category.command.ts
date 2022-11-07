import { RoleType } from "@prisma/client";
import { stripIndents } from "common-tags";

import { inlineCode } from "../../utils/formatters";
import { isInputRemoveSetting, removeCategoryMessage, removeGroupMessage } from "../../utils/util";
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
		const unsetCategoryMessage = removeCategoryMessage(commandCtx.server.getPrefix()); 

        // No argument passed? Give info instead
        if (!newCategory) {
            return commandCtx.server.modmailCategoryId
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      "Modmail category",
                      stripIndents`
					  	This server's modmail category has been set as the ID ${inlineCode(commandCtx.server.modmailCategoryId)}.
					
						${unsetCategoryMessage}
					`
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
				return ctx.messageUtil.replyWithError(message, "Error setting category!", stripIndents`
					This category either doesn't exist in ${commandCtx.server.modmailGroupId ? "the previously set group" : "this group"} or the bot does not the permissions to create/delete channels in it.

					${removeGroupMessage(commandCtx.server.getPrefix())}
				`)
			}
		}
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailCategoryId: endValue } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail category set`, 
			stripIndents`
				Successfully ${endValue ? `set the modmail category to ${inlineCode(newCategory)}` : "cleared the modmail category"}.${endValue ? `\n\n${unsetCategoryMessage}` : ""}
		`);
    },
};

export default ModmailCategory;
