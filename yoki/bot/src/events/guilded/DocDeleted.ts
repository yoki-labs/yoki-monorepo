import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { GEvent, LogChannelType } from "../../typings";
import { quoteChangedContent } from "../../utils/messages";

export default {
    execute: async ([doc, ctx]) => {
        const { serverId } = doc;

        // Ignore own comment deletions
        if (doc.createdBy === ctx.user!.id) return;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        await ctx.prisma.forumTopic.deleteMany({ where: { serverId, channelId: doc.channelId, forumTopicId: doc.id } });

        // check if there's a log channel channel for message deletions
        const deletedDocLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.doc_deletions);
        if (!deletedDocLogChannel) return;

        const member = await ctx.members.fetch(serverId, doc.createdBy).catch(() => null);
        if (member?.user?.type === UserType.Bot) return;

        const channel = await ctx.channels.fetch(doc.channelId).catch();

        const channelURL = `https://guilded.gg/teams/${serverId}/channels/${doc.channelId}/docs`;

        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog({
            where: deletedDocLogChannel.channelId,
            serverId,
            author: {
                icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                name: `Document deleted \u2022 ${member?.displayName ?? "Unknown user"}`,
            },
            // title: "Forum Topic Removed",
            description: `The document ${inlineQuote(doc.title)} by <@${doc.createdBy}> (${inlineCode(doc.createdBy)}) was deleted in [#${channel.name}](${channelURL}).`,
            additionalInfo: stripIndents`
                **When:** ${server.formatTimezone(new Date())}
                **Document ID:** ${inlineCode(doc.id)}
                **Channel ID:** ${inlineCode(doc.channelId)}
            `,
            color: Colors.red,
            // occurred: new Date().toISOString(),
            fields: [
                {
                    name: "Content",
                    value: await quoteChangedContent(ctx, serverId, doc.id, "forums", doc.content),
                },
            ],
        });
    },
    name: "docDeleted",
} satisfies GEvent<"docDeleted">;
