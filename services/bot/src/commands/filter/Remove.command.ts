import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { getFilterFromSyntax } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Delete: Command = {
    name: "filter-remove",
    subName: "remove",
    description: "Remove a word or phrase from the automod filter.",
    usage: "<phrase>",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "phrase",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const phrase = (args.phrase as string).toLowerCase();

        const [content, matching] = getFilterFromSyntax(phrase);

        const existingEntry = await ctx.prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content, matching } });
        if (!existingEntry) return ctx.messageUtil.replyWithError(message, `Phrase not found`, `This phrase is not in your server's filter!`);
        await ctx.dbUtil.removeWordFromFilter(message.serverId!, content, matching);
        return ctx.messageUtil.replyWithSuccess(message, `Phrase deleted`, `Successfully deleted ${inlineCode(phrase)} from the automod list!`);
    },
};

export default Delete;
