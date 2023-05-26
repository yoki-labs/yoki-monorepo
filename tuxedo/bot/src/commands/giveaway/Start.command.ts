import { Category, Command } from "../commands";

const minDuration = 15 * 60 * 1000;
const maxDuration = 14 * 24 * 60 * 60 * 1000;

const Start: Command = {
    name: "giveaway-start",
    description: "Creates a new giveaway",
    subName: "start",
    subCommand: true,
    category: Category.Events,
    // requiredRole: RoleType.MOD,
    args: [
        {
            name: "duration",
            type: "time",
        },
        {
            name: "winners",
            type: "number",
        },
        {
            name: "text",
            type: "rest",
        },
    ],
    execute: (message, _args, ctx) => {
        const duration = _args.duration as number;
        const text = _args.text as string;
        const winnerCount = _args.winners as number;

        if (winnerCount < 0 || winnerCount > 10) return ctx.messageUtil.replyWithError(message, `Invalid winner count`, `Winner count must be between 1 and 10.`);
        else if (duration < minDuration || duration > maxDuration)
            return ctx.messageUtil.replyWithError(message, `Invalid duration`, `Giveaway duration should be between 15 minutes and 2 weeks.`);

        return ctx.giveawayUtil.createGiveaway({
            serverId: message.serverId!,
            channelId: message.channelId,
            createdBy: message.createdById,
            text,
            endsAt: new Date(Date.now() + duration),
            winnerCount,
        });
    },
};

export default Start;
