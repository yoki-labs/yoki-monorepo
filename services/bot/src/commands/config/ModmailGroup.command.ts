import { RoleType } from "@prisma/client";

import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const ModmailGroup: Command = {
    name: "config-modmailgroup",
    description: "Add a mod role.",
    subCommand: true,
    usage: "[newGroup]",
    examples: ["", "3GMgagKd"],
    subName: "modmailgroup",
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [{ name: "newGroup", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const newGroup = args.newGroup as string | null;
        if (!newGroup) return ctx.messageUtil.replyWithInfo(message, "This server's modmail group", commandCtx.server.modmailGroupId ?? "not set");

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { modmailGroupId: newGroup } });
        return ctx.messageUtil.replyWithSuccess(message, `Modmail group set`, `Successfully set the modmail group to ${inlineCode(newGroup)}`);
    },
};

export default ModmailGroup;
