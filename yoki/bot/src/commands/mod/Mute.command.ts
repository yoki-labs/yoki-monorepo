import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { bold, inlineCode, listInlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { UserType } from "guilded.js";

import { CachedMember, RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Mute: Command = {
    name: "mute",
    description: "Mute the specified user for the specified amount of time (ex. 3h, 30m, 5d).",
    // usage: "<target> <time> [...reason]",
    examples: ["R40Mp0Wd 25m", "<@R40Mp0Wd> 1h Talking too much about Town of Salem"],
    requiredRole: RoleType.MINIMOD,
    category: Category.Moderation,
    aliases: ["hush", "timeout", "m"],
    args: [
        {
            name: "target",
            display: "user",
            type: "member",
        },
        {
            name: "duration",
            type: "time",
        },
        {
            name: "reason",
            type: "rest",
            optional: true,
            max: 500,
        },
    ],
    execute: async (message, args, ctx, { prefix, server }) => {
        if (!server.muteRoleId)
            return ctx.messageUtil.replyWithError(
                message,
                `No mute role set`,
                stripIndents`
                    There is no mute role configured for this server.

                    Set it by using \`${prefix}role mute\` command.
                `
        );

        const target = args.target as CachedMember;
        const duration = args.duration as number;
        if (target.user?.type === UserType.Bot) return;

        const reason = args.reason as string | null;
        // const duration = ms(args.duration as string);
        if (!duration || duration <= 894000) return ctx.messageUtil.replyWithError(message, `Duration must be longer`, `Your mute duration must be longer than 15 minutes.`);
        const expiresAt = new Date(Date.now() + duration);

        void ctx.amp.logEvent({
            event_type: "BOT_MEMBER_MUTE",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });
        await ctx.prisma.roleState.upsert({
            where: { serverId_userId: { serverId: message.serverId!, userId: target.user!.id } },
            update: { roles: target.roleIds },
            create: { serverId: message.serverId!, userId: target.user!.id, roles: target.roleIds },
        });

        await ctx.dbUtil.addActionFromMessage(
            message,
            {
                infractionPoints: 10,
                reason,
                targetId: target.user!.id,
                type: "MUTE",
                expiresAt,
            },
            server
        );

        let successMessage = `<@${message.authorId}>, you have successfully muted <@${target.user!.id}>.`;

        try {
            await ctx.messageUtil.sendEmbed(
                message.channelId,
                {
                    title: ":mute: You have been muted",
                    description: `<@${target.user!.id}>, you have been muted for ${bold(duration / 60000)} minutes.`,
                    color: Colors.red,
                    fields: [
                        reason && {
                            name: "Reason",
                            value: (reason as string).length > 1024 ? `${reason.substr(0, 1021)}...` : reason,
                        },
                    ].filter(Boolean) as EmbedField[],
                },
                {
                    isPrivate: true,
                }
            );
        } catch (error) {
            console.error(error);
            successMessage += "\n**I was unable to notify them.**";
        }

        const { failed } = await ctx.roleUtil.removeMultipleRoles(message.serverId!, target.user!.id, target.roleIds);
        if (failed.length) {
            successMessage += `\n\nThere was an issue removing the following roles due to improper permissions: ${listInlineCode(failed)}`;
        }

        try {
            await ctx.roles.addRoleToMember(message.serverId!, target.user!.id, server.muteRoleId);
        } catch (e) {
            return ctx.messageUtil.replyWithUnexpected(
                message,
                stripIndents`
					There was an issue muting this user. This is most likely due to misconfigured permissions for your server.
					${inlineCode((e as Error).message)}
				`,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.messageUtil.sendSuccessBlock(message.channelId, `User muted`, successMessage, undefined, {
            isPrivate: true,
        });

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Mute;
