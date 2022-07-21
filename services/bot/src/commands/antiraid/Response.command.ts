import { ResponseType } from "@prisma/client";

import { RoleType } from "../../typings";
import { antiRaidResponseTransformer } from "../../util";
import { Category } from "../Category";
import type { Command } from "../Command";

const responseTypes = ["captcha", "kick"];
const responseTypesDescriptions = {
    [ResponseType.CAPTCHA]: "presenting them with a captcha to solve which will kick them if they fail 3 times in a row.",
    [ResponseType.KICK]: "automatically kicking the user.",
};

const Challenge: Command = {
    name: "antiraid-challenge",
    description: "Set or view the response the bot takes when a user fails the age filter",
    usage: "[captcha|kick|none]",
    examples: ["captcha"],
    category: Category.Moderation,
    subCommand: true,
    subName: "challenge",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "responseType", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const challenge = args.challenge as string;
        if (!responseTypes.includes(challenge))
            return ctx.messageUtil.replyWithError(message, `Your response type must be one of the following: ${responseTypes.map((x) => `\`${x}\``).join(", ")}`);
        const transformedChallenge = antiRaidResponseTransformer(challenge);

        if (commandCtx.server.antiRaidResponse === transformedChallenge) return ctx.messageUtil.replyWithError(message, "You already have the anti-raid response set to this.");
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidResponse: transformedChallenge } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully set anti-raid response",
            `The bot will now present new members who fail the age account filter check by ${responseTypesDescriptions[transformedChallenge]}`
        );
    },
};

export default Challenge;
