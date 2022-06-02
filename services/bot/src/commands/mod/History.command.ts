import { inlineCode } from "../../formatters";
import { ContentFilterUtil } from "../../modules/content-filter";
import { CachedMember, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

// ID -- 17; Text -- 24; Max reason -- 100; Max filtered word length -- 59
const maxReason = 120;
const maxFiltered = 50;
// How many cases to show per page
const maxCases = Math.floor(2048 / (30 + maxReason + maxFiltered));

const History: Command = {
    name: "history",
    description: "Get the history for a user.",
    usage: "<targetId> [page number]",
    examples: ["R40Mp0Wd", "R40Mp0Wd 2"],
    aliases: ["modactions", "actions", "hs"],
    requiredRole: RoleType.MOD,
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
        if (page < 0) return ctx.messageUtil.replyWithAlert(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);

        if (!actions.length) return ctx.messageUtil.replyWithNullState(message, `Squeaky clean history!`, `This user does not have any moderation history associated with them.`);
        return ctx.messageUtil.replyWithPaginatedContent(
            message,
            `${inlineCode(target.user.name.replaceAll("`", "'"))}'s History`,
            actions.map((x) => {
                const trimmedReason = x.reason && x.reason.length > maxReason ? `${x.reason.substring(0, maxReason)}...` : x.reason;

                return `[${inlineCode(x.id)}] ${x.type} for ${trimmedReason ? inlineCode(trimmedReason) : "no provided reason "}${
                    (x.triggerContent && `||${x.triggerContent.length > maxFiltered ? `${x.triggerContent}...` : x.triggerContent}||`) ?? ""
                }`;
            }),
            maxCases,
            page,
            {
                fields: [
                    {
                        name: "Total Infraction Points",
                        value: ContentFilterUtil.totalAllInfractionPoints(actions).toString(),
                    },
                ],
            }
        );
    },
};

export default History;
