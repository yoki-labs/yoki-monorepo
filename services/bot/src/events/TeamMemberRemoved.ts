import type { WSTeamMemberRemovedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";

export default async (packet: WSTeamMemberRemovedPayload, ctx: Context) => {
    const { userId, serverId, isBan, isKick } = packet.d;

    if (isBan) void ctx.amp.logEvent({ event_type: "MEMBER_BAN", user_id: userId });
    else if (isBan) void ctx.amp.logEvent({ event_type: "MEMBER_KICK", user_id: userId });

    // check if there's a log channel channel for member leaves
    const memberLeaveLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_leaves);
    if (!memberLeaveLogChannel) return void 0;

    const action = isBan ? "Banned" : isKick ? "Kicked" : "Left";

    try {
        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog(
            memberLeaveLogChannel.channelId,
            `User Left`,
            stripIndents`
                **User:** <@${userId}> (${inlineCode(userId)})
                ${action ? `**Action Type:** ${action}` : ""}
            `,
            Colors.red,
            new Date().toISOString()
        );
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
    return void 0;
};
