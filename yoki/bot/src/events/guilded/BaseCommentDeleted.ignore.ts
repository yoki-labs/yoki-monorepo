import { inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { UserType } from "guilded.js";

import { Context, LogChannelType } from "../../typings";
import { quoteChangedContent } from "../../utils/messages";
import type { CommentPayload } from "./BaseCommentEvent.ignore";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";

export default async (serverId: string, parentId: number, comment: CommentPayload, contentType: "forums" | "docs" | "calendar", ctx: Context) => {
    // Ignore own comment deletions
    if (comment.createdBy === ctx.user!.id)
        return;

    const member = await ctx.members.fetch(serverId, comment.createdBy).catch(() => null);
    if (member?.user?.type === UserType.Bot)
        return;

    // check if there's a log channel channel for message deletions
    const deletedCommentLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.comment_deletions);
    if (!deletedCommentLogChannel) return;

    const channel = await ctx.channels.fetch(comment.channelId).catch();

    const channelURL = `https://guilded.gg/teams/${serverId}/channels/${comment.channelId}/${contentType}`;

    // send the log channel message with the content/data of the deleted message
    await ctx.messageUtil.sendLog({
        where: deletedCommentLogChannel.channelId,
        serverId,
        author: {
            icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
            name: `Comment edited \u2022 ${member?.displayName ?? "Unknown member"}`,
        },
        description: `A comment by <@${comment.createdBy}> (${inlineCode(comment.createdBy)}) was deleted in [#${channel.name}](${channelURL})

			Comment ID: ${inlineCode(comment.id)}
            Parent Content ID: ${inlineCode(parentId)} 
			Channel ID: ${inlineCode(comment.channelId)}
		`,
        color: Colors.red,
        // occurred: new Date().toISOString(),
        fields: [
            {
                name: "Content",
                value: await quoteChangedContent(ctx, serverId, comment.id, contentType, comment.content),
            },
        ],
    });
};
