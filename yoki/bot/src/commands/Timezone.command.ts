import { inlineQuote } from "@yokilabs/bot";

import timezones from "../static/timezones.json";
import { RoleType } from "../typings";
import { Category, Command } from "./commands";

const Timezone: Command = {
    name: "timezone",
    description: "Set or view the timezone of this server.",
    examples: ["America/New_York", ""],
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "newTimezone",
            display: "[new timezone](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs/347606)",
            type: "string",
            optional: true,
            max: 20,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const newTimezone = (args.newTimezone as string | null)?.toLowerCase();
        if (!newTimezone) {
            return ctx.messageUtil.replyWithInfo(message, "Timezone", `The timezone for this server is ${inlineQuote(commandCtx.server.getTimezone())}`);
        }
        if (!timezones.includes(newTimezone)) {
            return ctx.messageUtil.replyWithError(
                message,
                "Invalid timezone",
                "Your timezone selection must be from the following [list](https://www.guilded.gg/Yoki/groups/2dXLMBPd/channels/0a2069b9-2e7d-45da-9121-ab3b463f9af2/docs)"
            );
        }
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { timezone: newTimezone } });
        return ctx.messageUtil.replyWithSuccess(message, `Server timezone set`, `The timezone for this server has been set to ${inlineQuote(newTimezone)}.`);
    },
};

export default Timezone;
