import { RoleType } from "../../typings";
import { inlineCode } from "@yokilabs/util";
import { filterToString } from "../../utils/util";
import { Command, Category } from "../commands";

const List: Command = {
    name: "filter-list",
    description: "Lists every word or phrase that will be filtered by automod.",
    usage: "",
    subName: "list",
    subCommand: true,
    category: Category.Filter,
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
