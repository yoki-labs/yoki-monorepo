import type { EmbedField, Schema } from "@guildedjs/guilded-api-typings";
import { Action, ContentIgnoreType, Severity } from "@prisma/client";
import { codeBlock, inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import type { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";
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
        `${data.executorId === ctx.user!.id ? ":gear: " : ""} ${title}`,
        `<@${data.targetId}> (${inlineCode(data.targetId)}) ${description} by <@${data.executorId}> (${inlineCode(data.executorId)})`,
    ];
}

export const getActionFields = (data: Action): EmbedField[] =>
    [
        data.reason && {
            name: "Reason",
            value: data.reason ? codeBlock(data.reason) : "No reason provided.",
            inline: false,
        },
        data.triggerContent && {
            name: "Triggering Content",
            value: `\`${data.triggerContent}\``,
            inline: true,
        },
    ].filter(Boolean) as EmbedField[];

export const getActionAdditionalInfo = (data: Action, timezone: string): string =>
    stripIndents`
        **Infraction points:** ${inlineCode(data.infractionPoints)}
        **Case ID:** ${inlineCode(data.id)}
        ${data.expiresAt ? `**Expiration:** ${FormatDate(data.expiresAt, timezone)} EST` : ""}
    `;

export async function moderateContent(
    ctx: Context,
    server: Server,
    channelId: string,
    contentType: ContentIgnoreType,
    filteredContent: FilteredContent,
    createdBy: string,
    content: string,
    mentions: Schema<"Mentions"> | undefined,
    resultingAction: () => Promise<unknown>
) {
    const { serverId } = server;
    const channelIgnores = await ctx.dbUtil.getChannelIgnore(serverId, channelId, contentType);

    const enabledPresets = server.filterEnabled ? await ctx.dbUtil.getEnabledPresets(serverId) : undefined;

    if (server.filterEnabled && !channelIgnores.find((x) => x.type === "AUTOMOD")) {
        // scan the message for any harmful content (filter list, presets)
        await ctx.contentFilterUtil.scanContent({
            userId: createdBy,
            text: content,
            filteredContent,
            channelId,
            server,
            presets: enabledPresets,
            // Filter
            resultingAction,
        });

        // Spam prevention
        await ctx.spamFilterUtil.checkForSpam(server, createdBy, channelId, mentions, resultingAction);
    }

    if ((server.filterInvites && !channelIgnores.find((x) => x.type === "INVITE")) || (server.filterEnabled && !channelIgnores.find((x) => x.type === "URL")))
        // Invites or bad URLs
        await ctx.linkFilterUtil.checkLinks({
            server,
            userId: createdBy,
            channelId,
            content,
            filteredContent,
            contentType,
            presets: enabledPresets,
            resultingAction,
        });
}
