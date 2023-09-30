import { LogChannelType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";

import type { GEvent } from "../../typings";

export default {
    execute: async ([event, ctx]) => {
        const { serverId, userId, isBan, isKick } = event;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        if (isBan) void ctx.amp.logEvent({ event_type: "MEMBER_BAN", user_id: userId, event_properties: { serverId } });
        else if (isKick) void ctx.amp.logEvent({ event_type: "MEMBER_KICK", user_id: userId, event_properties: { serverId } });

        // We have separate ban logging for things like ban reasons. Ew, nested ifs
        if (!isBan) {
            // check if there's a log channel channel for member leaves
            const memberLeaveLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_leaves);
            if (memberLeaveLogChannel) {
                const action = isKick ? "been kicked out from" : "left";

                // send the log channel message with the content/data of the deleted message
                await ctx.messageUtil.sendLog({
                    where: memberLeaveLogChannel.channelId,
                    title: `User Left`,
                    serverId,
                    description: `<@${userId}> (${inlineCode(userId)}) has ${action} the server.`,
                    color: Colors.red,
                    occurred: new Date().toISOString(),
                });
            }
        }

        // Close and clear everything
        const modmailThreads = await ctx.prisma.modmailThread.findMany({ where: { serverId, openerId: userId, closed: false } });

        await Promise.all(
            modmailThreads.map(async (x) => {
                await ctx.prisma.modmailThread.update({
                    where: {
                        id: x.id,
                    },
                    data: {
                        closed: true,
                    },
                });

                void ctx.amp.logEvent({
                    event_type: "MODMAIL_CLOSE",
                    user_id: ctx.user!.id,
                    event_properties: { server: server.serverId, threadAge: Date.now() - x.createdAt.getTime() },
                });

                const modmailLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.modmail_logs);

                if (modmailLogChannel) {
                    const historyMessage = await ctx.supportUtil.createModmailHistory(server, x);

                    await ctx.supportUtil.sendModmailLog(serverId, x, modmailLogChannel, "automatically closed, because member has left the server", historyMessage);
                }
            })
        ).catch((x) => console.error("Error while automatically closing modmail threads:\n", x));
    },
    name: "memberRemoved",
} satisfies GEvent<"memberRemoved">;
