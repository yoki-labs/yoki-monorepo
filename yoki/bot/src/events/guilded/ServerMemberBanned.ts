import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType } from "@prisma/client";
import { codeBlock, stripIndents } from "common-tags";
import { MemberBan } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";
import { Colors } from "../../utils/color";
import { inlineCode } from "../../utils/formatters";


export default {
	execute: async ([memberBan, ctx]) => {
		const { serverId } = memberBan;
		const isMemberBanObj = memberBan instanceof MemberBan;
		const targetId = isMemberBanObj ? memberBan.target.id : memberBan.serverMemberBan.user.id;
		const reason = isMemberBanObj ? memberBan.reason : memberBan.serverMemberBan.reason;
		const createdAt = isMemberBanObj ? memberBan.createdAt.toISOString() : memberBan.serverMemberBan.createdAt;
		const createdBy = isMemberBanObj ? memberBan.createdById : memberBan.serverMemberBan.createdBy;

		// check if there's a log channel channel for member leaves
		const memberBanLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_bans);
		if (memberBanLogChannel) {
			try {
				// send the log channel message with the content/data of the deleted message
				await ctx.messageUtil.sendLog({
					where: memberBanLogChannel.channelId,
					title: `User Banned`,
					serverId,
					description: `<@${targetId}> (${inlineCode(targetId)}) has been banned from the server by <@${createdBy}>.`,
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
                            User: ${inlineCode(targetId)}
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
	},
	name: "memberBanned"
} satisfies GEvent<"memberBanned">;
