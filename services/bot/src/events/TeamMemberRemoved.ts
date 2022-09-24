import type { WSTeamMemberRemovedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";
import { closeModmailThread } from "../commands/modmail/Close.command";

import type { Context } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";

export default async (packet: WSTeamMemberRemovedPayload, ctx: Context) => {
    const { userId, serverId, isBan, isKick } = packet.d;

    if (isBan) void ctx.amp.logEvent({ event_type: "MEMBER_BAN", user_id: userId, event_properties: { serverId } });
    else if (isKick) void ctx.amp.logEvent({ event_type: "MEMBER_KICK", user_id: userId, event_properties: { serverId } });

    // check if there's a log channel channel for member leaves
    const memberLeaveLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_leaves);
    if (memberLeaveLogChannel) {
        const action = isBan ? "been banned from" : isKick ? "been kicked out from" : "left";

        try {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberLeaveLogChannel.channelId,
                title: `User Left`,
                description: `<@${userId}> (${inlineCode(userId)}) has ${action} the server.`,
                color: Colors.red,
                occurred: new Date().toISOString(),
            });
        } catch (e) {
            // generate ID for this error, not persisted in database
            const referenceId = nanoid();
            // send error to the error webhook
            if (e instanceof Error) {
                console.error(e);
                void ctx.errorHandler.send("Error in logging member leave event!", [
                    new WebhookEmbed()
                        .setDescription(
                            stripIndents`
                            Reference ID: ${inlineCode(referenceId)}
                            Server: ${inlineCode(serverId)}
                            User: ${inlineCode(userId)}
                            Error: \`\`\`
                            ${e.stack ?? e.message}
                            \`\`\`
                        `
                        )
                        .setColor("RED"),
                ]);
            }
        }
    }

    // Close and clear everything
    const modmailThreads = await ctx.prisma.modmailThread.findMany({ where: { serverId, openerId: userId, closed: false } });

    await Promise.all(modmailThreads.map((x) => closeModmailThread(serverId, ctx.userId || "Ann6LewA", ctx, x, "automatically closed, because member has left the server"))).catch(
        (x) => console.error("Error while automatically closing modmail threads:\n", x)
    );

    console.log(`Clearing cache of the user ${userId} in server ${serverId}`);
    await ctx.serverUtil.removeMemberCache(serverId, userId);
    return void 0;
};
