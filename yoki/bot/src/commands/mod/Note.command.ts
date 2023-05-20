import { inlineCode } from "@yokilabs/bot";
import { UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { getInfractionsFrom } from "../../utils/moderation";
import { Category, Command } from "../commands";

const Note: Command = {
    name: "note",
    description: "Adds an entry to someone's offence history without notifying them.",
    // usage: "<target> [infraction points] [...reason]",
    examples: [
        "R40Mp0Wd Talked about Town of Salem. Warned them in DMs.",
        "<@R40Mp0Wd> Can't stop talking about Town of Salem. Warned them publicly in chat.",
        "<@R40Mp0Wd> 2 Suspicious account, likely a bot.",
    ],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    aliases: ["n"],
    args: [
        {
            name: "target",
            display: "user",
            type: "member",
        },
        {
            name: "infractionPoints",
            display: "infraction points",
            type: "string",
            optional: true,
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
            max: 500,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const target = args.target as CachedMember;

        if (target.user!.type === UserType.Bot) return ctx.messageUtil.replyWithError(message, `Cannot place a note on bots`, `Bots cannot have moderation notes on them.`);

        const [reason, infractionPoints] = getInfractionsFrom(args);

        await ctx.dbUtil.addActionFromMessage(
            message,
            {
                reason,
                infractionPoints,
                targetId: target.user!.id,
                type: "NOTE",
                expiresAt: null,
            },
            commandCtx.server
        );

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `Moderation note added`,
            `<@${message.authorId}>, you have successfully added a new moderation note on ${target.user!.name} (${inlineCode(target.user!.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Note;
