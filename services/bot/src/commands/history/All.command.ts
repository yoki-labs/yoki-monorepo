import type { Action } from "@prisma/client";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

// ID -- 17; Text -- 34; User ID -- 12 Max reason -- 100; Max filtered word length -- 59
const maxReason = 100;
const maxFiltered = 59;
const maxCase = 17 + 34 + 12 + maxReason + maxFiltered;
// How many cases to show per page
const maxCases = Math.floor(2048 / maxCase);

const All: Command = {
    name: "history-all",
    subName: "all",
    description: "Gets the list of all moderation cases in this server.",
    usage: "[page number]",
    examples: ["", "2"],
    subCommand: true,
    aliases: ["see", "all", "v"],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    args: [
        {
            name: "page",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const page = args.page ? Math.floor((args.page as number) - 1) : 0;
        const actions = await ctx.prisma.action.findMany({
            where: {
                serverId: message.serverId!,
            },
        });

        // -1, -2, etc.
        if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);

        if (!actions.length) return ctx.messageUtil.replyWithNullState(message, `Squeaky clean history!`, `This server has no moderation cases.`);
        return ctx.messageUtil.replyWithPaginatedContent<Action>({
            replyTo: message,
            items: actions,
            title: `Server History`,
            itemMapping: (x) => {
                const trimmedReason = x.reason && x.reason.length > maxReason ? `${x.reason.substring(0, maxReason)}...` : x.reason;

                return `[${inlineCode(x.id)}] <@${x.targetId}> got **${x.type}** for ${trimmedReason ?? "no provided reason"} ${
                    (x.triggerContent && `||${x.triggerContent.length > maxFiltered ? `${x.triggerContent}...` : x.triggerContent}||`) ?? ""
                }`;
            },
            itemsPerPage: maxCases,
            page,
            message: {
                isSilent: true,
            },
        });
    },
};

export default All;
