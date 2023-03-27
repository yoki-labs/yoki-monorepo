import { LogChannelType, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";
import { UserType, WebhookEmbed } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";
import { generateCaptcha } from "../../utils/antiraid";
import { Colors } from "../../utils/color";
import { codeBlock, inlineCode } from "../../utils/formatters";
import { suspicious as sus } from "../../utils/util";

export default {
	execute: async ([member, ctx]) => {
		const { serverId } = member;		
		const server = await ctx.dbUtil.getServer(serverId, false);
		if(!server) return;

		const userId = member.user!.id;

		if (["!", "."].some((x) => member.user!.name.trim().startsWith(x))) {
			void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId } });
			await ctx.members.updateNickname(serverId, userId, member.user!.name.slice(1).trim() || "NON-HOISTING NAME");
		}

		// Re-add mute
		if (server.muteRoleId && (await ctx.prisma.action.findFirst({ where: { serverId, targetId: userId, type: Severity.MUTE, expired: false } }))) {
			void ctx.amp.logEvent({ event_type: "MEMBER_REMUTE_JOIN", user_id: userId, event_properties: { serverId } });
			await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId);
		}

		console.log(`${userId} joined ${server.serverId}, with account age of ${Date.now() - new Date(member.user!.createdAt!).getTime()}`);

		if (
			server.antiRaidEnabled &&
			server.antiRaidAgeFilter &&
			(Date.now() - new Date(member.user!.createdAt!).getTime() <= server.antiRaidAgeFilter || !member.user!.avatar)
		) {
			console.log(`User ${userId} tripped antiraid in server ${server.serverId}, response ${server.antiRaidResponse}`)
			void ctx.amp.logEvent({ event_type: "FRESH_ACCOUNT_JOIN", user_id: userId, event_properties: { serverId } });
			switch (server.antiRaidResponse) {
				case "TEXT_CAPTCHA": {
					if (server.antiRaidChallengeChannel) {
						let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
						void ctx.amp.logEvent({ event_type: "MEMBER_CAPTCHA_JOIN", user_id: userId, event_properties: { serverId } });

						if (!userCaptcha) {
							const { id, value, url } = await generateCaptcha(ctx.s3);
							const createdCaptcha = await ctx.prisma.captcha.create({
								data: { id, serverId, triggeringUser: userId, value, url },
							});
							userCaptcha = createdCaptcha;
						}

						if (server.muteRoleId) await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId).catch(() => null);
						// Have to complete captcha
						await ctx.messageUtil.sendWarningBlock(
							server.antiRaidChallengeChannel,
							`Halt! Please complete this captcha`,
							stripIndents`
                        <@${userId}>, your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.

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
					void ctx.amp.logEvent({ event_type: "MEMBER_KICKED_JOIN", user_id: userId, event_properties: { serverId } });
					await ctx.members.kick(serverId, userId);

					// Add this action to the database
					const createdCase = await ctx.dbUtil.addAction({
						serverId,
						type: "KICK",
						executorId: ctx.user!.id,
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
						void ctx.amp.logEvent({ event_type: "MEMBER_SITE_CAPTCHA_JOIN", user_id: userId, event_properties: { serverId } });

						if (!userCaptcha) {
							const id = nanoid();
							const createdCaptcha = await ctx.prisma.captcha.create({
								data: { id, serverId, triggeringUser: userId },
							});
							console.log(server.muteRoleId)
							userCaptcha = createdCaptcha;
						}

						console.log(`Muting user ${userId} in ${server.serverId} for site captcha`)
						if (server.muteRoleId) await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId).catch(() => null);
						// Have to complete captcha
						await ctx.messageUtil.sendWarningBlock(
							server.antiRaidChallengeChannel,
							`Halt! Please complete this captcha`,
							stripIndents`
                        <@${userId}>, your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.
                        
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
		const creationDate = new Date(member.user!.createdAt!);
		const suspicious = sus(creationDate);

		try {
			// send the log channel message with the content/data of the deleted message
			await ctx.messageUtil.sendLog({
				where: memberJoinLogChannel.channelId,
				title: `${member.user!.type === UserType.Bot ? "Bot Added" : "User Joined"}`,
				serverId: server.serverId,
				description: `<@${userId}> (${inlineCode(userId)}) has joined the server.`,
				color: suspicious ? Colors.yellow : Colors.green,
				occurred: member.joinedAt!.toISOString(),
				additionalInfo: stripIndents`
                                **Account Created:** ${server.formatTimezone(creationDate)} EST ${suspicious ? "(:warning: recent)" : ""}
                                **Joined at:** ${server.formatTimezone(member.joinedAt!)} EST
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
	},
	name: "memberJoined"
} satisfies GEvent<"memberJoined">;
