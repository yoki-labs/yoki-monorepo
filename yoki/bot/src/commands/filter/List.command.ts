import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { filterToString } from "../../utils/util";
import { Category, Command } from "../commands";

const List: Command = {
    name: "filter-list",
    description: "View the list of every word or phrase that will be filtered by automod.",
    // usage: "",
    subName: "list",
    subCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => {
        const bannedWords = await ctx.dbUtil.getBannedWords(message.serverId!);

        return ctx.messageUtil.replyWithList(
            message,
            "Banned words in this server",
            bannedWords.map((x) => `\u2022 ${inlineQuote(filterToString(x))} \u2014 ${inlineCode(x.severity)} (${inlineCode(x.infractionPoints)})`)
        );
    },
};

export default List;
