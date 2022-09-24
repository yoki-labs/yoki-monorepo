import type { ModmailThread } from "@prisma/client";
import { stripIndents } from "common-tags";
import type Client from "../../Client";

import { LogChannelType, RoleType } from "../../typings";
import { Colors } from "../../utils/color";
import { FormatDate } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Close: Command = {
    name: "close",
    subName: "close",
    description: "Close a modmail thread.",
    examples: [""],
    subCommand: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    execute: async (message, _args, ctx) => {
        const isCurrentChannelModmail = await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!isCurrentChannelModmail) return ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        return closeModmailThread(message.serverId!, message.createdBy, ctx, isCurrentChannelModmail!, "closed by a staff member");
    },
};

// To be able to use it anywhere
export async function closeModmailThread(serverId: string, closedBy: string, ctx: Client, modmailThread: ModmailThread, closedState: string) {
    const modmailLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.modmail_logs);
    const modmailMessages = await ctx.prisma.modmailMessage.findMany({
        where: { modmailThreadId: modmailThread.id },
    });

    if (modmailLogChannel) {
        const formattedMessages = modmailMessages.map((x) => `[${x.authorId}][${FormatDate(x.createdAt)}] ${x.content}`);
        const uploadedLog = await ctx.s3
            .upload({
                Bucket: process.env.S3_BUCKET,
                Key: `modmail/logs/${modmailThread.serverId}-${modmailThread.id}.txt`,
                Body: Buffer.from(stripIndents`
						-------------
						Opener: ${modmailThread.openerId}
						Server: ${modmailThread.serverId}
						Created At: ${FormatDate(modmailThread.createdAt)}
						-------------

						${formattedMessages.join("\n")}
					`),
                ContentType: "text/plain",
                ACL: "public-read",
            })
            .promise()
            .catch((e) => (console.error("Error while uploading log:\n", e), { Location: "https://guilded.gg/" }));

        await ctx.messageUtil.sendLog({
            where: modmailLogChannel.channelId,
            title: `Thread Closed`,
            description: `Thread \`#${modmailThread.id}\` created by <@${modmailThread.openerId}> has been ${closedState}.`,
            color: Colors.blue,
            occurred: new Date().toISOString(),
            fields: [
                {
                    name: `Chat Logs`,
                    value: stripIndents`
                            \`\`\`md
                            ${formattedMessages
                                .slice(0, 2)
                                .map((x) => x.slice(0, 400))
                                .join("\n")}
                            ${formattedMessages.length > 2 ? "..." : ""}
                            \`\`\`

                            [Click here to view more](${uploadedLog.Location})
                        `,
                },
            ],
        });
    }

    await ctx.rest.router
        .createChannelMessage(modmailThread.userFacingChannelId, {
            embeds: [
                {
                    description: stripIndents`<@${modmailThread.openerId}>
						This ticket has now been closed.
					`,
                    color: Colors.blue,
                    timestamp: new Date().toISOString(),
                },
            ],
            isPrivate: true,
        })
        .catch(() => void 0);
    void ctx.amp.logEvent({
        event_type: "MODMAIL_CLOSE",
        user_id: closedBy,
        event_properties: { serverId: serverId, threadAge: Date.now() - modmailThread.createdAt.getTime(), messageCount: modmailMessages.length },
    });

    await ctx.prisma.modmailThread.update({ where: { id: modmailThread.id }, data: { closed: true } });
    return ctx.rest.router.deleteChannel(modmailThread.modFacingChannelId);
}

export default Close;
