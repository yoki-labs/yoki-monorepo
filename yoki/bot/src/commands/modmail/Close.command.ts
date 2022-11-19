import type { ModmailThread } from "@prisma/client";
import { stripIndents } from "common-tags";

import type Client from "../../Client";
import { LogChannelType, RoleType, Server } from "../../typings";
import { Colors } from "../../utils/color";
import { Category } from "../Category";
import type { Command } from "../Command";

const Close: Command = {
    name: "close",
    subName: "close",
    description:
        "Close a modmail thread. If ran in a modmail channel, it will close the thread associated with that channel. If a user is mentioned, it will force close the open thread for that user.",
    examples: [""],
    subCommand: true,
    forceShow: true,
    requiredRole: RoleType.MINIMOD,
    category: Category.Modmail,
    args: [
        {
            name: "userId",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const userId = args.userId as string | null;

        const modmailChannel = userId
            ? await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId!, openerId: userId, closed: false } })
            : await ctx.prisma.modmailThread.findFirst({ where: { serverId: message.serverId, modFacingChannelId: message.channelId, closed: false } });
        if (!modmailChannel)
            return userId
                ? ctx.messageUtil.replyWithError(message, "No open modmail ticket for user", "User does not have an open modmail ticket")
                : ctx.messageUtil.replyWithError(message, `Not a modmail channel`, `This channel is not a modmail channel!`);

        return closeModmailThread(commandCtx.server, message.createdBy, ctx, modmailChannel!, "closed by a staff member");
    },
};

// To be able to use it anywhere
export async function closeModmailThread(server: Server, closedBy: string, ctx: Client, modmailThread: ModmailThread, closedState: string) {
    const modmailLogChannel = await ctx.dbUtil.getLogChannel(server.serverId, LogChannelType.modmail_logs);
    const modmailMessages = await ctx.prisma.modmailMessage.findMany({
        where: { modmailThreadId: modmailThread.id },
    });

    if (modmailLogChannel) {
        const formattedMessages = modmailMessages.map((x) => `[${x.authorId}][${server.formatTimezone(x.createdAt)}] ${x.content}`);
        const uploadedLog = await ctx.s3
            .upload({
                Bucket: process.env.S3_BUCKET,
                Key: `modmail/logs/${modmailThread.serverId}-${modmailThread.id}.txt`,
                Body: Buffer.from(stripIndents`
						-------------
						Opener: ${modmailThread.openerId}
						Server: ${modmailThread.serverId}
						Created At: ${server.formatTimezone(modmailThread.createdAt)}
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
        event_properties: { server: server.serverId, threadAge: Date.now() - modmailThread.createdAt.getTime(), messageCount: modmailMessages.length },
    });

    await ctx.prisma.modmailThread.update({ where: { id: modmailThread.id }, data: { closed: true } });
    return ctx.rest.router.deleteChannel(modmailThread.modFacingChannelId);
}

export default Close;
