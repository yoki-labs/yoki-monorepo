import { RoleType } from "@prisma/client";
import { Category, Command } from "../commands";

const minDuration = 15 * 60 * 1000;
const maxDuration = 14 * 24 * 60 * 60 * 1000;

const Start: Command = {
    name: "giveaway-start",
    description: "Creates a new giveaway that people can join and randomly win.",
    subName: "start",
    subCommand: true,
    category: Category.Events,
    requiredRole: RoleType.MINIMOD,
    args: [
        {
            name: "duration",
            type: "time",
        },
        {
            name: "winners",
            type: "number",
            max: 10
        },
        {
            name: "text",
            type: "rest",
            max: 200
        },
    ],
    execute: (message, _args, ctx, { server: { timezone } }) => {
        const duration = _args.duration as number;
        const text = _args.text as string;
        const winnerCount = _args.winners as number;

        if (winnerCount < 0 || winnerCount > 10) return ctx.messageUtil.replyWithError(message, `Invalid winner count`, `Winner count must be between 1 and 10.`);
        else if (duration < minDuration || duration > maxDuration)
            return ctx.messageUtil.replyWithError(message, `Invalid duration`, `Giveaway duration should be between 15 minutes and 2 weeks.`);

        return ctx.giveawayUtil.createGiveaway(
            {
                serverId: message.serverId!,
                channelId: message.channelId,
                createdBy: message.createdById,
                text,
                endsAt: new Date(Date.now() + duration),
                winnerCount,
            },
            timezone
        );
    },
};

export default Start;
