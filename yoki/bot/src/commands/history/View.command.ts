import type { Action } from "@prisma/client";

import { ContentFilterUtil } from "../../modules/content-filter";
import { CachedMember, RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

// ID -- 17; Text -- 24; Max reason -- 100; Max filtered word length -- 59
const maxReason = 100;
const maxFiltered = 59;
const maxCase = 17 + 26 + maxReason + maxFiltered;
// How many cases to show per page
const maxCases = Math.floor(2048 / maxCase);

const View: Command = {
    name: "history-view",
    subName: "view",
    description: "Get the list of moderation cases of a user.",
    usage: "<targetId> [page number]",
    examples: ["R40Mp0Wd", "R40Mp0Wd 2"],
    subCommand: true,
    aliases: ["see", "all", "v"],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    args: [
        {
            name: "target",
            type: "member",
        },
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.target as CachedMember;
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;
        const actions = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
                targetId: target.user.id,
            },
        });

        // -1, -2, etc.
        if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);

        if (!actions.length) return ctx.messageUtil.replyWithNullState(message, `Squeaky clean history!`, `This user does not have any moderation history associated with them.`);
        return ctx.messageUtil.replyWithPaginatedContent<Action>({
            replyTo: message,
            items: actions,
            title: `${target.user.name}'s History`,
            itemMapping: (x) => {
                const trimmedReason = x.reason && x.reason.length > maxReason ? `${x.reason.substring(0, maxReason)}...` : x.reason;

                return `[${inlineCode(x.id)}] **${x.type}** for ${trimmedReason ?? "no provided reason"} ${
                    (x.triggerContent && `||${x.triggerContent.length > maxFiltered ? `${x.triggerContent}...` : x.triggerContent}||`) ?? ""
                }`;
            },
            itemsPerPage: maxCases,
            page,
            embed: {
                fields: [
                    {
                        name: "Total Infraction Points",
                        value: ContentFilterUtil.totalAllInfractionPoints(actions).toString(),
                    },
                ],
            },
        });
    },
};

export default View;
