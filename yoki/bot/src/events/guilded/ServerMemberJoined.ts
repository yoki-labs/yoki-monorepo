import { LogChannelType, ResponseType, Severity } from "@prisma/client";
import { codeBlock, createUserMentionElement, emptyText, errorEmbed, inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { stripIndents } from "common-tags";
import { EmbedPayload, Member, UserType } from "guilded.js";
import { nanoid } from "nanoid";

import type { GEvent } from "../../typings";
import { generateCaptcha } from "../../utils/antiraid";
import { trimHoistingSymbols } from "../../utils/moderation";
import { suspicious as sus } from "../../utils/util";
import YokiClient from "../../Client";

export default {
    execute: async ([member, ctx]) => {
        const { serverId } = member;
        const user = member.user!;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        const userId = user.id;

        const nonHoistingName = trimHoistingSymbols(user.name);

        if (server.antiHoistEnabled && nonHoistingName !== user.name) {
            void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId } });
            await ctx.members.updateNickname(serverId, userId, nonHoistingName?.trim() || "NON-HOISTING NAME");
        }

        // Re-add mute
        if (server.muteRoleId && (await ctx.prisma.action.findFirst({ where: { serverId, targetId: userId, type: Severity.MUTE, expired: false } }))) {
            void ctx.amp.logEvent({ event_type: "MEMBER_REMUTE_JOIN", user_id: userId, event_properties: { serverId } });
            await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId);
        }

        console.log(`${userId} joined ${server.serverId}, with account age of ${Date.now() - new Date(member.user!.createdAt!).getTime()}`);
        
        const canFilterAnyone = !server.antiRaidAgeFilter && server.antiRaidResponse !== ResponseType.KICK;
        const memberJoinDateIsBelowRequirement = Date.now() - new Date(member.user!.createdAt!).getTime() <= (server.antiRaidAgeFilter ?? 0);
        const userHasNoAvatar = !member.user!.avatar

        if (
            server.antiRaidEnabled &&
            (canFilterAnyone || memberJoinDateIsBelowRequirement || userHasNoAvatar)
        ) {
            void ctx.amp.logEvent({ event_type: "FRESH_ACCOUNT_JOIN", user_id: userId, event_properties: { serverId } });
            switch (server.antiRaidResponse) {
                case "TEXT_CAPTCHA": {
                    if (!server.antiRaidChallengeChannel) break;

                    let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
                    void ctx.amp.logEvent({ event_type: "MEMBER_CAPTCHA_JOIN", user_id: userId, event_properties: { serverId } });

                    if (!userCaptcha) {
                        const { id, value, url } = await generateCaptcha(ctx.s3);
                        const createdCaptcha = await ctx.prisma.captcha.create({
                            data: { id, serverId, triggeringUser: userId, value, url },
                        });
                        userCaptcha = createdCaptcha;
                    }

                    console.log(`User captcha URL: ${userCaptcha.url}`);
                    if (server.muteRoleId) await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId).catch(() => null);

                    // Have to complete captcha
                    // There might be bots doing something behind the scenes and people may not be able to be mentioned for that period of time
                    await sendCaptcha(
                        ctx,
                        server.antiRaidChallengeChannel!,
                        member,
                        `Please run the following command with the code below: \`${server.getPrefix()}solve insert-code-here\`.`,
                        {
                            image: {
                                url: userCaptcha!.url!,
                            },
                            fields: [
                                {
                                    name: `Example`,
                                    value: codeBlock(`${server.getPrefix()}solve ahS9fjW`, `md`),
                                },
                            ],
                        }
                        )
                        .catch((err) => {
                            console.log(`Error notifying user of captcha for server ${serverId} because of ${err}`);
                            void ctx.errorHandler.send(`Error while handling antiraid site challenge for user ${member.id}`, [errorEmbed((err as Error).message)]);
        
                            setTimeout(() =>
                                sendCaptcha(
                                    ctx,
                                    server.antiRaidChallengeChannel!,
                                    member,
                                    `Please run the following command with the code below: \`${server.getPrefix()}solve insert-code-here\`.`,
                                    {
                                        image: {
                                            url: userCaptcha!.url!,
                                        },
                                        fields: [
                                            {
                                                name: `Example`,
                                                value: codeBlock(`${server.getPrefix()}solve ahS9fjW`, `md`),
                                            },
                                        ],
                                    }
                                )
                            , 60000);
                        });

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
                    if (!server.antiRaidChallengeChannel)
                        break;

                    let userCaptcha = await ctx.prisma.captcha.findFirst({ where: { serverId, triggeringUser: userId, solved: false } });
                    void ctx.amp.logEvent({ event_type: "MEMBER_SITE_CAPTCHA_JOIN", user_id: userId, event_properties: { serverId } });

                    if (!userCaptcha) {
                        const id = nanoid();
                        const createdCaptcha = await ctx.prisma.captcha.create({
                            data: { id, serverId, triggeringUser: userId },
                        });
                        userCaptcha = createdCaptcha;
                    }

                    if (server.muteRoleId) await ctx.roles.addRoleToMember(serverId, userId, server.muteRoleId).catch(() => null);
                    // Have to complete captcha
                    // There might be bots that are doing something else behind the scenes and those people might not be allowed to be privately mentioned
                    await sendCaptcha(
                        ctx,
                        server.antiRaidChallengeChannel!,
                        member,
                        `Please visit [this link](${process.env.NODE_ENV === "development" ? process.env.NEXTAUTH_URL ?? "http://localhost:3000" : "https://yoki.gg"}/verify/${
                            userCaptcha!.id
                        }) which will use a frameless captcha to verify you are not a bot.`
                    )
                        .catch((err) => {
                            console.log(`Error notifying user of captcha for server ${serverId} because of ${err}`);
                            void ctx.errorHandler.send(`Error while handling antiraid site challenge for user ${member.id}`, [errorEmbed((err as Error).message)]);

                            setTimeout(() =>
                                sendCaptcha(
                                    ctx,
                                    server.antiRaidChallengeChannel!,
                                    member,
                                    `Please visit [this link](${process.env.NODE_ENV === "development" ? process.env.NEXTAUTH_URL ?? "http://localhost:3000" : "https://yoki.gg"}/verify/${
                                        userCaptcha!.id
                                    }) which will use a frameless captcha to verify you are not a bot.`
                                )
                            , 60000);
                        });
                    break;
            }
            default: {
            }
        }
    }

    // check if there's a log channel channel for member joins
    const memberJoinLogChannel = await ctx.dbUtil.getLogChannel(serverId!, LogChannelType.member_joins);
    if (!memberJoinLogChannel) return;
    const creationDate = new Date(member.user!.createdAt!);
    const suspicious = sus(creationDate);

    // send the log channel message with the content/data of the deleted message
    await ctx.messageUtil.sendLog({
        where: memberJoinLogChannel.channelId,
        author: {
            icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
            name: `${member.user!.type === UserType.Bot ? "Bot added" : "User joined"} \u2022 ${member?.displayName ?? "Unknown user"}`,
        },
        // title: `${member.user!.type === UserType.Bot ? "Bot Added" : "User Joined"}`,
        serverId: server.serverId,
        description: `<@${userId}> (${inlineCode(userId)}) has joined the server.`,
        color: suspicious ? Colors.yellow : Colors.green,
        // occurred: member.joinedAt!.toISOString(),
        additionalInfo: stripIndents`
            **Account created:** ${server.formatTimezone(creationDate)} ${suspicious ? "(:warning: recent)" : ""}
            **Joined:** ${server.formatTimezone(member.joinedAt!)}
        `,
    });
},
name: "memberJoined",
} satisfies GEvent<"memberJoined">;

function sendCaptcha(ctx: YokiClient, channelId: string, member: Member, content: string, embed?: Partial<EmbedPayload> | undefined) {
    return ctx.messageUtil
        .sendWarningBlock(
            channelId,
            `Halt! Please complete this captcha`,
            stripIndents`
                <@${member.id}>, your account has tripped the anti-raid filter and requires further verification to ensure you are not a bot.

                ${content}
            `,
            embed,
            {
                isPrivate: true,
                content: {
                    object: "value",
                    document: {
                        object: "document",
                        data: {},
                        nodes: [
                            {
                                object: "block",
                                type: "paragraph",
                                data: {},
                                nodes: [
                                    emptyText,
                                    createUserMentionElement(member),
                                    emptyText,
                                ]
                            }
                        ]
                    }
                } as unknown as string
            },
        )
}