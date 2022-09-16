import { CachedMember, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { getInfractionsFrom } from "../../utils/moderation";
import { Category } from "../Category";
import type { Command } from "../Command";

const Note: Command = {
    name: "note",
    description: "Adds an entry to someone's offence history without notifying them.",
    usage: "<target's ID> [infraction points] [...reason]",
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    aliases: ["n"],
    args: [
        {
            name: "target",
            type: "member",
        },
        {
            name: "infractionPoints",
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
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;

        if (target.user.type === "bot") return ctx.messageUtil.replyWithError(message, `Cannot place a note on bots`, `Bots cannot have moderation notes on them.`);

        const [reason, infractionPoints] = getInfractionsFrom(args);

        await ctx.dbUtil.addActionFromMessage(message, {
            reason,
            infractionPoints,
            targetId: target.user.id,
            type: "NOTE",
            expiresAt: null,
        });

        await ctx.messageUtil.sendSuccessBlock(
            message.channelId,
            `Moderation note added`,
            `<@${message.createdBy}>, you have successfully added a new moderation note on ${target.user.name} (${inlineCode(target.user.id)}).`,
            undefined,
            {
                isPrivate: true,
            }
        );

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Note;
