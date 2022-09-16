import { ResponseType } from "@prisma/client";

import { RoleType } from "../../typings";
import { antiRaidResponseTransformer } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const responseTypes = ["captcha", "kick"];
const responseTypesDescriptions = {
    [ResponseType.CAPTCHA]: "presenting them with a captcha to solve which will kick them if they fail 3 times in a row.",
    [ResponseType.KICK]: "automatically kicking the user.",
};

const Challenge: Command = {
    name: "antiraid-challenge",
    description: "Set or view the response the bot takes when a user fails the age filter.",
    usage: "[captcha|kick|none]",
    examples: ["captcha"],
    category: Category.Moderation,
    subCommand: true,
    subName: "challenge",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "challenge", type: "string", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const challenge = (args.challenge as string | null)?.toLowerCase();
        if (!challenge)
            return ctx.messageUtil.replyWithInfo(
                message,
                "Current challenge",
                `The bot challenges new members who fail the age account filter check by ${
                    commandCtx.server.antiRaidResponse ? responseTypes[commandCtx.server.antiRaidResponse] : "doing nothing."
                }`
            );
        if (!responseTypes.includes(challenge))
            return ctx.messageUtil.replyWithAlert(
                message,
                `Invalid response type`,
                `Your response type must be one of the following: ${responseTypes.map((x) => `\`${x}\``).join(", ")}`
            );
        const transformedChallenge = antiRaidResponseTransformer(challenge);

        if (challenge === "captcha" && !commandCtx.server.muteRoleId)
            return ctx.messageUtil.replyWithAlert(
                message,
                `No mute role`,
                `You need to set a mute role using \`${commandCtx.server.getPrefix()}config muterole\`, otherwise unverified members would still have access to your community.`
            );
        if (commandCtx.server.antiRaidResponse === transformedChallenge)
            return ctx.messageUtil.replyWithAlert(message, `Already set`, "You already have the anti-raid response set to this.");
        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidResponse: transformedChallenge } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully set anti-raid response",
            `The bot will now challenge new members who fail the age account filter check by ${responseTypesDescriptions[transformedChallenge]}`
        );
    },
};

export default Challenge;
