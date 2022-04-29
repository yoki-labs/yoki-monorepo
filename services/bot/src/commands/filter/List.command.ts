import Embed from "@guildedjs/embeds";

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
                ? {
                      content: "Here's the banned word list:",
                      embeds: [
                          new Embed({
                              title: ":scroll: Banned words",
                              description: `These are the custom banned words for this server: ${bannedWords.map((word) => `\`${word.content}\``).join(", ")}`,
                              color: ctx.messageUtil.colors.default,
                          }),
                      ],
                  }
                : {
                      content: "Here's the banned word list:",
                      embeds: [
                          new Embed({
                              title: ":scroll: No banned words",
                              description: `There are no custom banned words for this server.`,
                              color: ctx.messageUtil.colors.dull,
                          }),
                      ],
                  }
        );
    },
};

export default List;
