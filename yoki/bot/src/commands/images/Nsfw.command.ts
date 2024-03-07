import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { premiumTierValues } from "../../utils/premium";
import { Category, Command } from "../commands";

const Nsfw: Command = {
    name: "nsfw",
    description: "Set how much confidence NSFW detection should have when filtering images.",
    examples: ["0.5 0.7", ""],
    requiredRole: RoleType.ADMIN,
    category: Category.Filter,
    args: [
        {
            name: "hentaiConfidence",
            display: "hentai detection confidence",
            type: "number",
            min: 0.1,
            max: 1,
            allowDecimal: true,
            optional: true,
        },
        {
            name: "pornConfidence",
            display: "porn detection confidence",
            type: "number",
            min: 0.1,
            max: 1,
            allowDecimal: true,
            optional: true,
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        const hentaiConfidence = args.hentaiConfidence as number | null;
        const pornConfidence = args.pornConfidence as number | null;

        if (!server.premium || premiumTierValues[server.premium] < premiumTierValues.Silver)
            return ctx.messageUtil.replyWithUnpermitted(message, `This server doesn't have the required **Silver** premium tier to use this function.`);
        // 2 or 0 arguments allowed
        else if (hentaiConfidence !== null && pornConfidence === null)
            return ctx.messageUtil.replyWithError(message, "Expected 2 arguments", `Expected to have 2 or 0 arguments in total.`);
        // Show the values
        else if (hentaiConfidence === null && pornConfidence === null)
            return ctx.messageUtil.replyWithInfo(
                message,
                "NSFW detection confidence",
                stripIndents`
                    **Porn confidence:** \`${(server.nsfwPornConfidence ?? ctx.imageFilterUtil.defaultPornConfidence) * 100}%\`
                    **Hentai confidence:** \`${(server.nsfwHentaiConfidence ?? ctx.imageFilterUtil.defaultHentaiConfidence) * 100}%\`
                `
            );

        await ctx.prisma.server.update({
            where: {
                id: server.id,
            },
            data: {
                nsfwHentaiConfidence: hentaiConfidence === ctx.imageFilterUtil.defaultHentaiConfidence ? null : hentaiConfidence,
                nsfwPornConfidence: pornConfidence === ctx.imageFilterUtil.defaultPornConfidence ? null : pornConfidence,
            },
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            "NSFW detection confidence changed",
            `The NSFW image filter will now require porn confidence of \`${pornConfidence! * 100}%\` and hentai confidence of \`${hentaiConfidence! * 100}%\`.`
        );
    },
};

export default Nsfw;
