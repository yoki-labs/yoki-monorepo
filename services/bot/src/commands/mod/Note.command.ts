import i18next from "i18next";

import { getInfractionsFrom } from "../../moderation-util";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Note: Command = {
    name: "note",
    description: "Adds an entry to someone's offence history without notifying them",
    usage: "<target's ID> [infraction points] [...reason]",
    requiredRole: RoleType.MOD,
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

        const [reason, infractionPoints] = getInfractionsFrom(args);

        await ctx.dbUtil.addActionFromMessage(message, {
            reason,
            infractionPoints,
            targetId: target.user.id,
            type: "NOTE",
            expiresAt: null,
        });

        await ctx.messageUtil.sendSuccessBlock(message.channelId, i18next.t("note.title"), i18next.t("note.description", { authorId: message.createdBy, target }), undefined, {
            isPrivate: true,
        });

        return ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
    },
};

export default Note;
