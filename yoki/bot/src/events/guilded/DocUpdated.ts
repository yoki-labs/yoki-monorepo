import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import type { EmbedField } from "guilded.js";

import { GEvent, LogChannelType } from "../../typings";
import { quoteChangedContent } from "../../utils/messages";

export default {
    execute: async ([doc, oldDoc, ctx]) => {
        const { serverId } = doc;

        // Ignore own forum topic updates
        if (doc.createdBy === ctx.user!.id) return;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // Scanning
        const member = await ctx.members.fetch(serverId, doc.createdBy).catch(() => null);

        // check if there's a log channel channel for message deletions
        const editedDocLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.doc_edits);
        if (!editedDocLogChannel) return;

        const channel = await ctx.channels.fetch(doc.channelId).catch();

        const channelURL = `https://guilded.gg/teams/${serverId}/channels/${doc.channelId}/docs`;

        const contentChanged = oldDoc?.content !== doc.content;

        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog({
            where: editedDocLogChannel.channelId,
            author: {
                icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                name: `Document edited \u2022 ${member?.displayName ?? "Unknown user"}`,
            },
            // title: "Forum Topic Edited",
            serverId: server.serverId,
            description: `The document ${inlineQuote(doc.title)} by <@${doc.createdBy}> (${inlineCode(doc.createdBy)}) has been edited in [#${channel.name}](${channelURL}) by <@${
                doc.updatedBy
            }> (${inlineCode(doc.updatedBy)}).`,
            color: Colors.yellow,
            additionalInfo: stripIndents`
                **When:** ${server.formatTimezone(new Date(doc.updatedAt!))}
                **Document ID:** ${inlineCode(doc.id)}
                **Channel ID:** ${inlineCode(doc.channelId)}
            `,
            // occurred: new Date().toISOString(),
            fields: [
                oldDoc?.title !== doc.title && {
                    name: "Title changes",
                    value: `${oldDoc?.title ? inlineQuote(oldDoc?.title) : "Unknown title"} -> ${inlineQuote(doc.title)}`,
                },
                contentChanged && {
                    name: "Old content",
                    value: await quoteChangedContent(ctx, serverId, doc.id, "docs", oldDoc?.content),
                },
                contentChanged && {
                    name: "New content",
                    value: await quoteChangedContent(ctx, serverId, doc.id, "docs", doc.content),
                },
            ].filter(Boolean) as EmbedField[],
        });
    },
    name: "docUpdated",
} satisfies GEvent<"docUpdated">;
