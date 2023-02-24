import { Context, LogChannelType } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";
import { quoteChangedContent } from "../utils/messages";
import type { CommentPayload } from "./BaseCommentEvent";

export default async (serverId: string, parentId: number, comment: CommentPayload, contentType: "forums" | "docs" | "calendar", ctx: Context) => {
    const member = await ctx.serverUtil.getMember(serverId, comment.createdBy).catch(() => null);
    if (member?.user.type === "bot") return;

    // check if there's a log channel channel for message deletions
    const deletedCommentLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.comment_deletions);
    if (!deletedCommentLogChannel) return void 0;

    const channel = await ctx.channelUtil.getChannel(comment.channelId).catch();

    const channelURL = `https://guilded.gg/teams/${serverId}/channels/${comment.channelId}/${contentType}`;

    // send the log channel message with the content/data of the deleted message
    await ctx.messageUtil.sendLog({
        where: deletedCommentLogChannel.channelId,
        serverId,
        title: "Comment Removed",
        description: `A comment by <@${comment.createdBy}> (${inlineCode(comment.createdBy)}) was deleted in [#${channel.name
            }](${channelURL})

			Comment ID: ${inlineCode(comment.id)}
            Parent Content ID: ${inlineCode(parentId)} 
			Channel ID: ${inlineCode(comment.channelId)}
		`,
        color: Colors.red,
        occurred: new Date().toISOString(),
        fields: [
            {
                name: "Content",
                value: await quoteChangedContent(ctx, serverId, comment.id, contentType, comment.content),
            },
        ],
    });

    return void 0;
};
