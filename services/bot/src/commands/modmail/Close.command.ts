import { stripIndents } from "common-tags";

import { LogChannelType, RoleType } from "../../typings";
import { Colors } from "../../utils/color";
import { FormatDate } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Close: Command = {
    name: "close",
    subName: "close",
    description: "Close a modmail thread",
    examples: [""],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    execute: async (message, _args, ctx) => {
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, "This channel is not a modmail channel!");
        const modmailLogChannel = await ctx.dbUtil.getLogChannel(message.serverId!, LogChannelType.modmail_logs);
        const modmailMessages = await ctx.prisma.modmailMessage.findMany({
            where: { modmailThreadId: isCurrentChannelModmail.id },
        });

        if (modmailLogChannel) {
            const uploadedLog = await ctx.s3
                .upload({
                    Bucket: process.env.S3_BUCKET,
                    Key: `logs/message-update-${message.serverId}-${message.id}.txt`,
                    Body: Buffer.from(stripIndents`
						-------------
						Opener: ${isCurrentChannelModmail.openerId}
						Server: ${isCurrentChannelModmail.serverId}
						Created At: ${FormatDate(isCurrentChannelModmail.createdAt)}
						-------------

						${modmailMessages.map((x) => `[${x.authorId}][${FormatDate(x.createdAt)}] ${x.content}`).join("\n")}
					`),
                    ContentType: "text/plain",
                    ACL: "public-read",
                })
                .promise();
            await ctx.messageUtil.send(
                modmailLogChannel.channelId,
                stripIndents`
					Thread #${isCurrentChannelModmail.id} closed on ${FormatDate(new Date())} with chat log available [here](${uploadedLog.Location})
				`
            );
        }

        void ctx.amp.logEvent({
            event_type: "MODMAIL_CLOSE",
            user_id: message.createdBy,
            event_properties: { serverId: message.serverId, threadAge: Date.now() - isCurrentChannelModmail.createdAt.getTime(), messageCount: modmailMessages.length },
        });
        await ctx.rest.router.createChannelMessage(isCurrentChannelModmail.userFacingChannelId, {
            embeds: [
                {
                    description: stripIndents`<@${isCurrentChannelModmail.openerId}>
						This ticket has now been closed.
					`,
                    color: Colors.blue,
                    timestamp: new Date().toISOString(),
                },
            ],
            isPrivate: true,
        });
        await ctx.prisma.modmailThread.update({ where: { id: isCurrentChannelModmail.id }, data: { closed: true } });
        return ctx.rest.router.deleteChannel(message.channelId);
    },
};

export default Close;
