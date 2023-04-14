import { LogChannelType } from "@prisma/client";
import { Colors, inlineCode } from "@yokilabs/util";
import { codeBlock, stripIndents } from "common-tags";
import { WebhookEmbed } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";


export default {
	execute: async ([memberBan, ctx]) => {
		const { serverId } = memberBan;
		const targetId = memberBan.target.id
		const { reason } = memberBan;
		const createdAt = memberBan.createdAt.toISOString();
		const createdBy = memberBan.createdById;

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
