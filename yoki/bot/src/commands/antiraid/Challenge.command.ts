import { ResponseType } from "@prisma/client";

import { RoleType } from "../../typings";
import { antiRaidResponseTransformer } from "../../utils/util";
import { Category, Command } from "../commands";

const responseTypes = ["captcha", "site", "kick"];
const responseTypesDescriptions = {
    [ResponseType.TEXT_CAPTCHA]: "presenting them with a captcha to solve which will kick them if they fail 3 times in a row.",
    [ResponseType.KICK]: "automatically kicking the user.",
    [ResponseType.SITE_CAPTCHA]: "verifying them with a link.",
};
const mappedResponseTypes = `${responseTypes.map((x) => `\`${x}\``).join(", ")}`;

const Challenge: Command = {
    name: "antiraid-challenge",
    description: "Set or view the response the bot takes when a user fails the age filter.",
    // usage: "[site|captcha|kick|none]",
    examples: ["captcha", "site"],
    category: Category.Entry,
    subCommand: true,
    subName: "challenge",
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "challenge",
            type: "string",
            display: "site / captcha / kick / none",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const challenge = (args.challenge as string | null)?.toLowerCase();
        if (!challenge)
            return ctx.messageUtil.replyWithInfo(
                message,
                "Current challenge",
                `The bot challenges new members who fail the age account filter check by **${
                    commandCtx.server.antiRaidResponse ? responseTypesDescriptions[commandCtx.server.antiRaidResponse] : "doing nothing."
                }**
				
				You can set this by running the command again with one of the following options: ${mappedResponseTypes}
				`
            );
        if (!responseTypes.includes(challenge))
            return ctx.messageUtil.replyWithError(message, `Invalid response type`, `Your response type must be one of the following: ${mappedResponseTypes}`);
        const transformedChallenge = antiRaidResponseTransformer(challenge);

        if (["captcha", "site"].some((x) => x === transformedChallenge) && !commandCtx.server.muteRoleId)
            return ctx.messageUtil.replyWithError(
                message,
                `No mute role`,
                `You need to set a mute role using \`${commandCtx.server.getPrefix()}config muterole\`, otherwise unverified members would still have access to your community.`
            );

        if (commandCtx.server.antiRaidResponse === transformedChallenge)
            return ctx.messageUtil.replyWithError(message, `Already set`, "You already have the anti-raid response set to this.");

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidResponse: transformedChallenge } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully set anti-raid response",
            `The bot will now challenge new members who fail the age account filter check by ${responseTypesDescriptions[transformedChallenge]}`
        );
    },
};

export default Challenge;
