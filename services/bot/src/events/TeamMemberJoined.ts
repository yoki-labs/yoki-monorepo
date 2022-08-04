import { Embed } from "@guildedjs/embeds";
import type { WSTeamMemberJoinedPayload } from "@guildedjs/guilded-api-typings";
import { Embed as WebhookEmbed } from "@guildedjs/webhook-client";
import Captcha from "@haileybot/captcha-generator";
import { LogChannelType, Severity } from "@prisma/client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context, Server } from "../typings";
import { Colors } from "../utils/color";
import { inlineCode } from "../utils/formatters";
import { FormatDate, suspicious as sus } from "../utils/util";

export default async (packet: WSTeamMemberJoinedPayload, ctx: Context, server: Server) => {
    const { member, serverId } = packet.d;

    if (["!", "."].some((x) => member.user.name.trim().startsWith(x)))
        await ctx.rest.router.updateMemberNickname(packet.d.serverId, packet.d.member.user.id, packet.d.member.user.name.slice(1).trim() || "NON-HOISTING NAME");

    // Re-add mute
    if (server.muteRoleId && (await ctx.prisma.action.findFirst({ where: { serverId, targetId: member.user.id, type: Severity.MUTE, expired: false } })))
        await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId);

    // check if there's a log channel channel for member joins
    const memberJoinLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.MEMBER_JOIN);
    if (!memberJoinLogChannel) return void 0;
    const creationDate = new Date(member.user.createdAt);
    const suspicious = sus(creationDate);
    const userId = packet.d.member.user.id;

    if (server.antiRaidAgeFilter && Date.now() - new Date(packet.d.member.user.createdAt).getTime() <= server.antiRaidAgeFilter) {
        switch (server.antiRaidResponse ?? "KICK") {
            case "CAPTCHA": {
                if (!server.antiRaidChallengeChannel) return;
                let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
                if (!userCaptcha) {
                    const captcha = new Captcha();
                    const id = nanoid();
                    if (server.muteRoleId) await ctx.rest.router.assignRoleToMember(serverId, member.user.id, server.muteRoleId).catch(() => null);
                    const uploadToBucket = await ctx.s3
                        .upload({
                            Bucket: process.env.S3_BUCKET,
                            Key: `captcha/${id}`,
                            Body: Buffer.from(captcha.dataURL.replace(/^data:image\/\w+;base64,/, ""), "base64"),
                            ContentEncoding: "base64",
                            ContentType: "image/jpeg",
                            ACL: "public-read",
                        })
                        .promise();
                    const createdCaptcha = await ctx.prisma.captcha.create({
                        data: { id, serverId: packet.d.serverId, triggeringUser: packet.d.member.user.id, value: captcha.value.toLowerCase(), url: uploadToBucket.Location },
                    });
                    userCaptcha = createdCaptcha;
                }
                await ctx.messageUtil.send(server.antiRaidChallengeChannel, {
                    isPrivate: true,
                    embeds: [
                        new Embed()
                            .setTitle("Halt! Please complete this captcha")
                            .setDescription(
                                `<@${member.user.id}> Your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.\n\n Please run the following command with the code below: \`${server.getPrefix()}solve insert-code-here\`.\nExample: \`?solve ahS9fjW\``
                            )
                            .setImage(userCaptcha.url)
                            .toJSON(),
                    ],
                });

                break;
            }
            case "KICK": {
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
                ctx.emitter.emit("ActionIssued", { ...createdCase }, ctx);
                return;
            }
        }
    }

    try {
        // send the log channel message with the content/data of the deleted message
        await ctx.messageUtil.sendLog(
            memberJoinLogChannel.channelId,
            "User Joined",
            stripIndents`
                **User:** <@${member.user.id}> (${inlineCode(member.user.id)})
                **Type** ${member.user.type ?? "user"}
				**Account Created:** \`${FormatDate(creationDate)} ${suspicious ? "(recent)" : ""}\`
            `,
            suspicious ? Colors.yellow : Colors.green,
            member.joinedAt
        );
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
