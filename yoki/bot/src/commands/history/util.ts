import type { Action, Prisma } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import type { Message } from "guilded.js";

import type YokiClient from "../../Client";
import { ContentFilterUtil } from "../../modules/content-filter";

// ID -- 17; Text -- 27; User ID -- 12, Max action name -- 7, Max reason -- 100; Max filtered word length -- 59
const maxReason = 100;
const maxFiltered = 59;
const maxCase = 17 + 27 + 7 + 12 + maxReason + maxFiltered;
// How many cases to show per page
const maxCases = Math.floor(2048 / maxCase);

export async function displayHistory<T extends Prisma.ActionFindManyArgs>(
    message: Message,
    ctx: YokiClient,
    findInfo: Prisma.SelectSubset<T, Prisma.ActionFindManyArgs>,
    page: number,
    historyName: string,
    multipleUsers = false
) {
    // -1, -2, etc.
    if (page < 0) return ctx.messageUtil.replyWithError(message, `Specify appropriate page`, `The page number must not be below \`1\`.`);

    const actions = await ctx.prisma.action.findMany(findInfo);

    if (!actions.length) return ctx.messageUtil.replyWithNullState(message, `Squeaky clean history!`, `There are no moderation cases.`);

    return ctx.messageUtil.replyWithPaginatedContent<Action>({
        replyTo: message,
        items: actions,
        title: historyName,
        itemMapping: (x) => {
            const trimmedReason = x.reason && x.reason.length > maxReason ? `${x.reason.substring(0, maxReason)}...` : x.reason;

            return `[${inlineCode(x.id)}] ${multipleUsers ? `<@${x.targetId}> got ` : " "}**${x.type}** for ${trimmedReason ?? "no provided reason"} ${displayFilteredContent(
                x.triggerContent
            )}`;
        },
        itemsPerPage: maxCases,
        page,
        message: {
            isSilent: true,
        },
        embed: multipleUsers
            ? undefined
            : {
                  fields: [
                      {
                          name: "Total Infraction Points",
                          value: ContentFilterUtil.totalAllInfractionPoints(actions).toString(),
                      },
                  ],
              },
    });
}

// Displays filtered content in || || if they exist and makes it smaller in length if necessary.
const displayFilteredContent = (triggerContent: string | null) =>
    (triggerContent && `||${triggerContent.length > maxFiltered ? `${triggerContent.substring(0, maxFiltered - 3)}...` : triggerContent}||`) ?? "";
