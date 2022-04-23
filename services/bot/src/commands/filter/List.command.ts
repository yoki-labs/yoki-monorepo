import { RoleType } from "../../typings";
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
        const bannedWords = await ctx.contentFilterUtil.getBannedWords(message.serverId!);
        return ctx.messageUtil.send(
            message.channelId,
            bannedWords.length
                ? `These are the custom banned words for this server: ${bannedWords.map((word) => `||${word.content}||`).join(", ")}`
                : "There are no custom banned words for this server"
        );
    },
};

export default List;
