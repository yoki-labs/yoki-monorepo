import type { EmbedField, Schema } from "@guildedjs/guilded-api-typings";
import { Action, ContentIgnoreType, Severity } from "@prisma/client";
import { codeBlock, inlineCode } from "@yokilabs/bot";
import { formatDate } from "@yokilabs/utils";
import { stripIndents } from "common-tags";

import type { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";
import { premiumTierValues } from "./premium";

const numberCharCodeStart = 48;
const numberCharCodeEnd = 57;
const capitalLetterCharCodeStart = 65;
const capitalLetterCharCodeEnd = 90;
const smallLetterCharCodeStart = 97;
const smallLetterCharCodeEnd = 122;

export function trimHoistingSymbols(name: string) {
    // charCode < numberCharCodeStart ||
    // (charCode > numberCharCodeEnd && charCode < capitalLetterCharCodeStart) ||
    // (charCode > capitalLetterCharCodeEnd && charCode < smallLetterCharCodeStart) ||
    // charCode > smallLetterCharCodeEnd
    // Go through all the name until the non-hoisting symbols at the start are filtered
    for (let i = 0; i < name.length; i++) {
        const charCode = name.charCodeAt(i);

        if (
            (charCode >= numberCharCodeStart && charCode <= numberCharCodeEnd) ||
            (charCode >= capitalLetterCharCodeStart && charCode <= capitalLetterCharCodeEnd) ||
            (charCode >= smallLetterCharCodeStart && charCode <= smallLetterCharCodeEnd)
        )
            return name.substring(i);
    }
    return null;
}

export function getInfractionsFrom(args: Record<string, any>): [string | null, number] {
    const reasonArg = args.reason as string | null;
    const infractionPointsArg = Number(args.infractionPoints);

    const reason = Number.isNaN(infractionPointsArg) && args.infractionPoints ? `${args.infractionPoints as string} ${reasonArg ?? ""}`.trimEnd() : reasonArg;
    const infractionPoints = Number.isNaN(infractionPointsArg) ? 5 : Math.floor(infractionPointsArg);

    return [reason, infractionPoints];
}

export async function moderateContent(
    ctx: Context,
    server: Server,
    channelId: string,
    contentType: ContentIgnoreType,
    filteredContent: FilteredContent,
    userId: string,
    roleIds: number[],
    content: string,
    mentions: Schema<"Mentions"> | undefined,
    resultingAction: () => Promise<unknown>
) {
    const { serverId } = server;
    const channelIgnores = await ctx.dbUtil.getChannelIgnore(serverId, channelId, contentType);

    const enabledPresets = server.filterEnabled ? await ctx.dbUtil.getEnabledPresets(serverId) : undefined;

    const canFilter = server.filterEnabled && !channelIgnores.find((x) => x.type === "AUTOMOD");
    const canFilterLinks = (server.filterInvites && !channelIgnores.find((x) => x.type === "INVITE")) || (server.filterEnabled && !channelIgnores.find((x) => x.type === "URL"));
    const canScanImages = server.scanNSFW && server.premium && premiumTierValues[server.premium] > premiumTierValues.Copper && !channelIgnores.find((x) => x.type === "NSFW");

    return Promise.any(
        [
            // scan the message for any harmful content (filter list, presets)
            canFilter &&
                ctx.contentFilterUtil
                    .scanContent({
                        userId,
                        roleIds,
                        text: content,
                        filteredContent,
                        channelId,
                        server,
                        presets: enabledPresets,
                        // Filter
                        resultingAction,
                    })
                    .then((success) => {
                        // To be ignored in Promise.any
                        if (!success) throw 0;
                    }),
            // Spam prevention
            canFilter &&
                ctx.spamFilterUtil.checkForSpam(server, userId, channelId, mentions, resultingAction).then((success) => {
                    // To be ignored in Promise.any
                    if (!success) throw 0;
                }),
            // Invites or bad URLs
            canFilterLinks &&
                ctx.linkFilterUtil
                    .checkLinks({
                        server,
                        userId,
                        channelId,
                        content,
                        filteredContent,
                        contentType,
                        presets: enabledPresets,
                        resultingAction,
                    })
                    .then((success) => {
                        // To be ignored in Promise.any
                        if (!success) throw 0;
                    }),
            canScanImages &&
                ctx.imageFilterUtil.scanMessageMedia(server, channelId, content, userId, resultingAction).then((success) => {
                    // To be ignored in Promise.any
                    if (!success) throw 0;
                }),
        ].filter(Boolean)
    )
        .then(() => true)
        .catch(() => false);
}

export const describeAction = (data: Action): string[] =>
    ({
        [Severity.NOTE]: ["Moderation note added", "had a moderation note placed on them"],
        [Severity.WARN]: ["User warned", "has been warned"],
        [Severity.MUTE]: ["User muted", "has been muted"],
        [Severity.SOFTBAN]: ["User flushed", "has been softbanned and their content has been cleared"],
        [Severity.BAN]: ["User banned", "has been banned"],
        [Severity.KICK]: ["User kicked", "has been kicked"],
    }[data.type]);

export function getActionInfo(data: Action & { isAutomod?: boolean }): [string, string] {
    const [title, description] = describeAction(data);

    return [
        title,
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
        ${data.infractionPoints ? `**Infraction points:** ${inlineCode(data.infractionPoints)}` : ""}
        **Case ID:** ${inlineCode(data.id)}
        ${data.expiresAt ? `**Expiration:** ${formatDate(data.expiresAt, timezone)}` : ""}
    `;
