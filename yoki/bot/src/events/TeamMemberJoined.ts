import type { WSTeamMemberJoinedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import { LogChannelType, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context, Server } from "../typings";
import { generateCaptcha } from "../utils/antiraid";
import { Colors } from "../utils/color";
import { codeBlock, inlineCode } from "../utils/formatters";
import { suspicious as sus } from "../utils/util";

export default async (packet: WSTeamMemberJoinedPayload, ctx: Context, server: Server) => {
	const { member, serverId } = packet.d;

	if (["!", "."].some((x) => member.user.name.trim().startsWith(x))) {
		void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });
		await ctx.rest.router.updateMemberNickname(packet.d.serverId, packet.d.member.user.id, packet.d.member.user.name.slice(1).trim() || "NON-HOISTING NAME");
	}

	// Re-add mute
	if (server.muteRoleId && (await ctx.prisma.action.findFirst({ where: { serverId, targetId: member.user.id, type: Severity.MUTE, expired: false } }))) {
		void ctx.amp.logEvent({ event_type: "MEMBER_REMUTE_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });
		await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId);
	}

	const userId = packet.d.member.user.id;
	if (
		server.antiRaidEnabled &&
		server.antiRaidAgeFilter &&
		(Date.now() - new Date(packet.d.member.user.createdAt).getTime() <= server.antiRaidAgeFilter || !member.user.avatar)
	) {
		void ctx.amp.logEvent({ event_type: "FRESH_ACCOUNT_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });
		switch (server.antiRaidResponse) {
			case "TEXT_CAPTCHA": {
				if (server.antiRaidChallengeChannel) {
					let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
					void ctx.amp.logEvent({ event_type: "MEMBER_CAPTCHA_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });

					if (!userCaptcha) {
						const { id, value, url } = await generateCaptcha(ctx.s3);
						const createdCaptcha = await ctx.prisma.captcha.create({
							data: { id, serverId: packet.d.serverId, triggeringUser: packet.d.member.user.id, value, url },
						});
						userCaptcha = createdCaptcha;
					}

					if (server.muteRoleId) await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId).catch(() => null);
					// Have to complete captcha
					await ctx.messageUtil.sendWarningBlock(
						server.antiRaidChallengeChannel,
						`Halt! Please complete this captcha`,
						stripIndents`
                        <@${member.user.id}>, your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.

                        Please run the following command with the code below: \`${server.getPrefix()}solve insert-code-here\`.
                    `,
						{
							image: {
								url: userCaptcha.url!,
							},
							fields: [
								{
									name: `Example`,
									value: codeBlock(`?solve ahS9fjW`, `md`),
								},
							],
						},
						{
							isPrivate: true,
						}
					).catch((err) => console.log(`Error notifying user of captcha for server ${serverId} because of ${err}`));
				}
				break;
			}
			case "KICK": {
				void ctx.amp.logEvent({ event_type: "MEMBER_KICKED_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });
				await ctx.rest.router.kickMember(packet.d.serverId, packet.d.member.user.id);

				// Add this action to the database
				const createdCase = await ctx.dbUtil.addAction({
					serverId,
					type: "KICK",
					executorId: ctx.userId!,
					reason: `[AUTOMOD] User failed account age requirement.`,
					triggerContent: null,
					channelId: null,
					targetId: userId,
					infractionPoints: 0,
					expiresAt: null,
				});

				// If a modlog channel is set
				ctx.emitter.emit("ActionIssued", { ...createdCase }, server, ctx);
				return;
			}
			case "SITE_CAPTCHA": {
				if (server.antiRaidChallengeChannel) {
					let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
					void ctx.amp.logEvent({ event_type: "MEMBER_SITE_CAPTCHA_JOIN", user_id: member.user.id, event_properties: { serverId: packet.d.serverId } });

					if (!userCaptcha) {
						const id = nanoid();
						const createdCaptcha = await ctx.prisma.captcha.create({
							data: { id, serverId: packet.d.serverId, triggeringUser: packet.d.member.user.id },
						});
						console.log(server.muteRoleId)
						userCaptcha = createdCaptcha;
					}

					if (server.muteRoleId) await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId).catch(() => null);
					// Have to complete captcha
					await ctx.messageUtil.sendWarningBlock(
						server.antiRaidChallengeChannel,
						`Halt! Please complete this captcha`,
						stripIndents`
                        <@${member.user.id}>, your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.
                        
						Please visit [this link](${process.env.NODE_ENV === "development" ? (process.env.NEXTAUTH_URL ?? "http://localhost:3000") : "https://yoki.gg"}/verify/${userCaptcha.id}) which will use a frameless captcha to verify you are not a bot.
                    `,
						undefined,
						server.muteRoleId ? { isPrivate: true } : undefined
					).catch((err) => console.log(`Error notifying user of captcha for server ${serverId} because of ${err}`));
				}
				break;
			}
			default: { }
		}
	}

	// check if there's a log channel channel for member joins
	const memberJoinLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_joins);
	if (!memberJoinLogChannel) return void 0;
	const creationDate = new Date(member.user.createdAt);
	const suspicious = sus(creationDate);

	try {
		// send the log channel message with the content/data of the deleted message
		await ctx.messageUtil.sendLog({
			where: memberJoinLogChannel.channelId,
			title: `${member.user.type === "bot" ? "Bot Added" : "User Joined"}`,
			description: `<@${member.user.id}> (${inlineCode(member.user.id)}) has joined the server.`,
			color: suspicious ? Colors.yellow : Colors.green,
			occurred: member.joinedAt,
			additionalInfo: stripIndents`
                                **Account Created:** ${server.formatTimezone(creationDate)} EST ${suspicious ? "(:warning: recent)" : ""}
                                **Joined at:** ${server.formatTimezone(new Date(member.joinedAt))} EST
                            `,
		});
	} catch (e) {
		// generate ID for this error, not persisted in database
		const referenceId = nanoid();
		// send error to the error webhook
		if (e instanceof Error) {
			console.error(e);
			void ctx.errorHandler.send("Error in logging member join!", [
				new WebhookEmbed()
					.setDescription(
						stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(packet.d.serverId)}
						User: ${inlineCode(member.user.id)}
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
