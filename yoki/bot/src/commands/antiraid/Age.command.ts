import { ResponseType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import ms from "ms";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const minDuration = 10 * 60 * 1000;
const maxDuration = 30 * 24 * 60 * 60 * 1000;

const Age: Command = {
    name: "antiraid-age",
    description: "Set or view the minimum account age requirement for users to be exempt from the antiraid.",
    // usage: "[duration]",
    examples: ["2d"],
    category: Category.Entry,
    subCommand: true,
    subName: "age",
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "duration",
            type: "time",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const duration = args.duration as number;

        if (args.duration === null) {
            return ctx.messageUtil.replyWithInfo(
                message,
                "Current Antiraid Age",
                `The current minimum account age for the antiraid filter is ${
                    commandCtx.server.antiRaidAgeFilter ? `${inlineCode(commandCtx.server.antiRaidAgeFilter / 60 / 1000)} minutes` : "not set"
                }.`
            );
        }

        // const duration = ms(args.duration as string);
        if (duration !== 0 && (duration < minDuration || duration > maxDuration))
            return ctx.messageUtil.replyWithError(message, `Invalid Duration`, `Your duration must be between 10 minutes (\`10m\`) and 30 days (\`30d\`) or 0 to catch anyone.`);

        void ctx.amp.logEvent({ event_type: "ANTIRAID_AGE_SET", user_id: message.authorId, event_properties: { serverId: message.serverId!, age: duration } });
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidAgeFilter: duration || null, antiRaidResponse: ResponseType.TEXT_CAPTCHA } });

        if (duration === 0)
            return ctx.messageUtil.replyWithSuccess(
                message,
                "Successfully set age filter",
                `All accounts will now be caught in the filter unless the antiraid challenge is a kick.\n\nBy default, the bot will present them with a captcha to solve, but you can configure this using the \`antiraid response\` command.`
            );
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully set age filter",
            `Accounts younger than ${ms(duration, {
                long: true,
            })} will be caught in the filter.\n\nBy default, the bot will present them with a captcha to solve, but you can configure this using the \`antiraid response\` command.`
        );
    },
};

export default Age;
