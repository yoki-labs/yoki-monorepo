import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { Action, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";

import type { Context } from "../typings";
import { codeBlock, inlineCode } from "./formatters";
import { FormatDate } from "./util";

export function getInfractionsFrom(args: Record<string, any>): [string | null, number] {
    const reasonArg = args.reason as string | null;
    const infractionPointsArg = Number(args.infractionPoints);

    const reason = Number.isNaN(infractionPointsArg) && args.infractionPoints ? `${args.infractionPoints as string} ${reasonArg ?? ""}`.trimEnd() : reasonArg;
    const infractionPoints = infractionPointsArg || 5;

    return [reason, infractionPoints];
}

export const describeAction = (data: Action): string[] =>
    ({
        [Severity.NOTE]: ["Moderation Note Added", "had a moderation note placed on them"],
        [Severity.WARN]: ["User Warned", "has been warned"],
        [Severity.MUTE]: ["User Muted", "has been muted"],
        [Severity.SOFTBAN]: ["User Softbanned", "has been softbanned and their content has been cleared"],
        [Severity.BAN]: ["User Banned", "has been banned"],
        [Severity.KICK]: ["User Kicked", "has been kicked"],
    }[data.type]);

export function getActionInfo(ctx: Context, data: Action & { isAutomod?: boolean }): [string, string] {
    const [title, description] = describeAction(data);

    return [
        `${data.executorId === ctx.userId ? ":gear: " : ""} ${title}`,
        `<@${data.targetId}> (${inlineCode(data.targetId)}) ${description} by <@${data.executorId}> (${inlineCode(data.executorId)})`,
    ];
}

export const getActionFields = (data: Action): EmbedField[] =>
    [
        data.reason && {
            name: "Reason",
            value: data.reason ? codeBlock(data.reason) : "No reason provided.",
            inline: Boolean(data.triggerContent),
        },
        data.triggerContent && {
            name: "Triggering Content",
            value: `||${data.triggerContent}||`,
            inline: true,
        },
    ].filter(Boolean) as EmbedField[];

export const getActionAdditionalInfo = (data: Action): string =>
    stripIndents`
        **Infraction points:** ${inlineCode(data.infractionPoints)}
        **Case ID:** ${inlineCode(data.id)}
        ${data.expiresAt ? `**Expiration:** ${FormatDate(data.expiresAt)} EST` : ""}
    `;
