import { inlineCode } from "../../utils/formatters";
import { RoleType } from "../../typings";
import { filterToString } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const List: Command = {
    name: "filter-list",
    description: "Add a word or phrase to the automod filter",
    usage: "",
    subName: "list",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const bannedWords = await ctx.dbUtil.getBannedWords(message.serverId!);

        return bannedWords.length
            ? ctx.messageUtil.replyWithInfo(
                message,
                `Banned words`,
                `These are the custom banned words for this server: ${bannedWords.map((word) => inlineCode(filterToString(word))).join(", ")}`
            )
            : ctx.messageUtil.replyWithNullState(message, `No banned words`, `There are no custom banned words for this server.`);
    },
};

export default List;
