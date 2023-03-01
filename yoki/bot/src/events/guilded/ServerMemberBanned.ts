import type { WSTeamMemberBannedPayload } from "";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context, Server } from "../typings";
import { Colors } from "../utils/color";
import { codeBlock, inlineCode } from "../utils/formatters";

export default async (packet: WSTeamMemberBannedPayload, ctx: Context, server: Server) => {
	const { serverId, serverMemberBan: { user, reason, createdAt, createdBy } } = packet.d;

	// check if there's a log channel channel for member leaves
	const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
	if (memberBanLogChannel) {
		try {
			// send the log channel message with the content/data of the deleted message
			await ctx.messageUtil.sendLog({
				where: memberBanLogChannel.channelId,
				title: `User Banned`,
				serverId: server.serverId,
				description: `<@${user.id}> (${inlineCode(user.id)}) has been banned from the server by <@${createdBy}>.`,
				color: Colors.red,
				fields: [
					{
						name: "Reason",
						value: reason ? codeBlock(reason) : "No reason provided."
					}
				],
				occurred: createdAt,
			});
		} catch (e) {
			// generate ID for this error, not persisted in database
			const referenceId = nanoid();
			// send error to the error webhook
			if (e instanceof Error) {
				console.error(e);
				void ctx.errorHandler.send("Error in logging member banned event!", [
					new WebhookEmbed()
						.setDescription(
							stripIndents`
                            Reference ID: ${inlineCode(referenceId)}
                            Server: ${inlineCode(serverId)}
                            User: ${inlineCode(user.id)}
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
	return void 0;
};
