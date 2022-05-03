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
        const bannedWords = await ctx.dbUtil.getBannedWords(message.serverId!);

        return bannedWords.length
            ? ctx.messageUtil.sendContentBlock(
                  message.channelId,
                  "Banned words",
                  `These are the custom banned words for this server: ${bannedWords.map((word) => `\`${word.content}\``).join(", ")}`
              )
            : ctx.messageUtil.sendNullBlock(message.channelId, "No banned words", `There are no custom banned words for this server.`);
    },
};

export default List;
