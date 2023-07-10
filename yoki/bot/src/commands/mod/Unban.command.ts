import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { errorLoggerS3 } from "../../utils/s3";
import { Category, Command } from "../commands";

const Unban: Command = {
    name: "unban",
    description: "unban a user.",
    // usage: "<targetId>",
    examples: ["R40Mp0Wd", "<@R40Mp0Wd>"],
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "targetId",
            display: "user ID",
            type: "string",
        },
    ],
    execute: async (message, args, ctx) => {
        const target = args.targetId as string;

        const existingBan = await ctx.bans.fetch(message.serverId!, target, true).catch(() => null);
        if (!existingBan)
            return ctx.messageUtil.replyWithError(
                message,
                `This user is not banned.`,
                "Yoki could not find a ban associated with this user, or the user you've provided doesn't actually exist. Keep in mind, you should be providing the user's ID.",
                undefined,
                { isPrivate: true }
            );

        try {
            await ctx.bans.unban(message.serverId!, target);
        } catch (e) {
            await errorLoggerS3(ctx, "unban", e as Error, { target, serverId: message.serverId });
            return ctx.messageUtil.replyWithUnexpected(
                message,
                stripIndents`
                There was an issue unbanning this user. This is most likely due to the user not existing, or the bot not having permission to unban them.
            `,
                undefined,
                { isPrivate: true }
            );
        }

        await ctx.prisma.action.updateMany({ where: { serverId: message.serverId!, targetId: target, type: "BAN" }, data: { expired: true, expiresAt: new Date() } });
        await ctx.messageUtil.sendSuccessBlock(message.channelId, `User unbanned`, `<@${message.authorId}>, you have successfully unbanned ${inlineCode(target)}.`, undefined, {
            isPrivate: true,
        });

        return ctx.messages.delete(message.channelId, message.id);
    },
};

export default Unban;
