import { RoleType } from "@prisma/client";
import { stripIndents } from "common-tags";

import { inlineCode } from "../../utils/formatters";
import { isInputRemoveSetting, removeCategoryMessage, removeGroupMessage } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const ModmailGroup: Command = {
    name: "modmail-group",
    description: "Set the modmail group where new channels are created.",
    subCommand: true,
    usage: "[ID of the new group]",
    examples: ["", "3GMgagKd"],
    subName: "group",
    category: Category.Settings,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newGroup", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const newGroup = args.newGroup as string | null;
		const unsetGroupMessage = removeGroupMessage(commandCtx.server.getPrefix()); 

        // No argument? Give info instead
        if (!newGroup) {
            return commandCtx.server.modmailCategoryId
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      "Modmail group",
                      stripIndents`
					  This server's modmail group has been set as the ID ${inlineCode(commandCtx.server.modmailGroupId)}.
					  
					  ${unsetGroupMessage}
					  `
                  )
                : ctx.messageUtil.replyWithNullState(message, "No modmail group", "This server does not have modmail group set.");
        }

		const endValue: string | null = isInputRemoveSetting(newGroup) ? null : newGroup;
		if(endValue) {
			try {
				const createdChannel = await ctx.rest.router.createChannel({ "name": "PLACEHOLDER-MODMAIL-CHANNEL", type: "chat", serverId: message.serverId!, categoryId: commandCtx.server.modmailCategoryId ?? undefined, groupId: newGroup})
				await ctx.rest.router.deleteChannel(createdChannel.channel.id);
			} catch(e) {
				return ctx.messageUtil.replyWithError(message, "Error setting group!", 
				stripIndents`
					This group either doesn't exist, ${commandCtx.server.modmailCategoryId ? "the modmail category you have already set doesn't exist in this group, " : ""}or the bot does not the permissions to create/delete channels in it.
				
					${removeCategoryMessage(commandCtx.server.getPrefix())}
				`)
			}
		}
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailGroupId: endValue } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail group set`, stripIndents`
			Successfully ${endValue ? `set the modmail group to ${inlineCode(newGroup)}` : "cleared the modmail group"}.${endValue ? `\n\n${unsetGroupMessage}` : ""}
		`);
    },
};

export default ModmailGroup;
