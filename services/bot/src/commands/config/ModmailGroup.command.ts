import { RoleType } from "@prisma/client";

import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const ModmailGroup: Command = {
    name: "config-modmailgroup",
    description: "Set the modmail group where new channels are created.",
    subCommand: true,
    usage: "[newGroup]",
    examples: ["", "3GMgagKd"],
    subName: "modmailgroup",
    category: Category.Moderation,
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

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailGroupId: newGroup === "null" ? null : newGroup } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail group set`, `Successfully set the modmail group to ${inlineCode(newGroup)}`);
    },
};

export default ModmailGroup;
