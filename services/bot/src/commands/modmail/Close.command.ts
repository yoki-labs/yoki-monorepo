import { stripIndents } from "common-tags";

import { LogChannelType, RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Close: Command = {
    name: "modmail-close",
    subName: "close",
    description: "Close a modmail thread",
    examples: [""],
    subCommand: true,
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    execute: async (message, _args, ctx) => {
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, "This channel is not a modmail channel!");
        const modmailLogChannel = await ctx.prisma.logChannel.findFirst({ where: { serverId: message.serverId!, type: LogChannelType.MODMAIL_LOG } });
        if (modmailLogChannel) {
            const modmailMessages = await ctx.prisma.modmailMessage.findMany({
                where: { modmailThreadId: isCurrentChannelModmail.id },
            });
            const uploadedLog = await ctx.s3
                .upload({
                    Bucket: process.env.S3_BUCKET,
                    Key: `logs/message-update-${message.serverId}-${message.id}.txt`,
                    Body: Buffer.from(stripIndents`
						-------------
						Opener: ${isCurrentChannelModmail.openerId}
						Server: ${isCurrentChannelModmail.serverId}
						Created At: ${isCurrentChannelModmail.createdAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZoneName: "short",
                        })}
						-------------

						${modmailMessages
                            .map(
                                (x) =>
                                    `[${x.authorId}][${x.createdAt.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZoneName: "short",
                                    })}] ${x.content}`
                            )
                            .join("\n")}
					`),
                    ContentType: "text/plain",
                    ACL: "public-read",
                })
                .promise();
            await ctx.messageUtil.send(
                modmailLogChannel.channelId,
                stripIndents`
					Thread #${isCurrentChannelModmail.id} closed on ${new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                })} with chat log available [here](${uploadedLog.Location})
				`
            );
        }
        await ctx.prisma.modmailThread.update({ where: { id: isCurrentChannelModmail.id }, data: { closed: true } });
        return ctx.rest.router.deleteChannel(message.channelId);
    },
};

export default Close;
