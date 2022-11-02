import { RoleType } from "@prisma/client";

import { inlineCode } from "../../utils/formatters";
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

        // No argument? Give info instead
        if (!newGroup) {
            return commandCtx.server.modmailCategoryId
                ? ctx.messageUtil.replyWithInfo(
                      message,
                      "Modmail group",
                      `This server's modmail group has been set as category by the ID ${inlineCode(commandCtx.server.modmailGroupId)}.`
                  )
                : ctx.messageUtil.replyWithNullState(message, "No modmail group", "This server does not have modmail group set.");
        }

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailGroupId: newGroup === "remove" ? null : newGroup } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail group set`, `Successfully set the modmail group to ${inlineCode(newGroup)}`);
    },
};

export default ModmailGroup;
