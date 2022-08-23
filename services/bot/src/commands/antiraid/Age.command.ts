import { ResponseType } from "@prisma/client";
import ms from "ms";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Age: Command = {
    name: "antiraid-age",
    description: "Set or view the minimum account age requirement for users to be exempt from the antiraid.",
    usage: "[duration]",
    examples: ["2d"],
    category: Category.Moderation,
    subCommand: true,
    subName: "age",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "duration", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        if (!args.duration) {
            return ctx.messageUtil.replyWithInfo(message, "Test", "placeholder");
        }

        const duration = ms(args.duration as string);
        if (!duration || duration <= 600000 || duration >= 1209600000)
            return ctx.messageUtil.replyWithAlert(message, `Invalid Duration`, `Your duration must be between 10m and 2w.`);
        void ctx.amp.logEvent({ event_type: "ANTIRAID_AGE_SET", user_id: message.createdBy, event_properties: { serverId: message.serverId, age: duration } });
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidAgeFilter: duration, antiRaidResponse: ResponseType.CAPTCHA } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully set age filter",
            `Accounts younger than ${
                duration / 60 / 1000
            } minutes will be caught in the filter. By default, the bot will present them with a captcha to solve, but you can configure this using the \`antiraid response\` command.`
        );
    },
};

export default Age;
