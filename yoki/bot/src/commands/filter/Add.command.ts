import { Severity } from "@prisma/client";
import { inlineCode, inlineQuote } from "@yokilabs/bot";

import { ResolvedEnum, RoleType } from "../../typings";
import { getFilterFromSyntax } from "../../utils/util";
import { Category, Command } from "../commands";
import { wordPresets } from "../../utils/presets";
import { ONLY_URL_REGEX } from "../../utils/matching";

const maxPhrases = 50;

const Add: Command = {
    name: "filter-add",
    subName: "add",
    description: "Add a word or phrase to the automod filter.",
    // usage: "<phrase> [severity=warn] [infraction_points=5]",
    examples: ["test_word warn", "test_word_2 kick"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Filter,
    args: [
        {
            name: "phrase",
            type: "string",
        },
        {
            name: "severity",
            type: "enum",
            display: "severity = warn",
            optional: true,
            values: Severity,
        },
        {
            name: "infraction_points",
            display: "infraction points = 5",
            type: "number",
            optional: true,
            min: 0,
            max: 100,
        },
    ],
    execute: async (message, args, ctx, { server, prefix }) => {
        const phrase = (args.phrase as string).toLowerCase();
        const severity = ((args.severity as ResolvedEnum)?.resolved ?? Severity.WARN) as Severity;
        const infractionPoints = (args.infraction_points as number | null) ?? 5;

        // Since it's going to be something like *a*, *a, a*, a with wildcards as *
        const [content, matching] = getFilterFromSyntax(phrase);

        // To see count of them
        const allBannedWords = await ctx.dbUtil.getBannedWords(message.serverId!);

        // To not have DB blow up
        if (allBannedWords.length >= maxPhrases)
            return ctx.messageUtil.replyWithError(message, "Too many words", `For technical reasons, you cannot have more than ${maxPhrases} words added to the filter. You can join the [Yoki Labs server](https://guilded.gg/yoki) to suggest new presets or enable any of the existing ones by using ${inlineQuote(`${prefix}preset`)}.`);
        // Can't add something that already exists
        else if (allBannedWords.find((x) => x.content === content && x.matching === matching))
            return ctx.messageUtil.replyWithError(message, `Already added`, `This word is already in your server's filter!`);

        // Suggest using preset instead
        const inPreset = Object.keys(wordPresets).find((x) => wordPresets[x].test(content));
        
        await ctx.dbUtil.addWordToFilter({
            content,
            creatorId: message.authorId,
            serverId: message.serverId!,
            matching,
            severity,
            infractionPoints,
        });

        const additionalMessages = [
            inPreset && `\u2022 **NOTE:** This phrase is already in a preset ${inlineCode(inPreset)}. You can enable presets by typing ${inlineQuote(`${prefix}preset enable ${inPreset}`)}`,
            ONLY_URL_REGEX.test(content) && `\u2022 **NOTE:** This phrase seems to be a link. Yoki has better link matching when it's added in the link or invite filter. Use ${inlineQuote(`${prefix}link url add`)} to add links to the filter.`,
            !server.filterEnabled && `\u2022 **WARNING:** The filter is currently disabled. To enable it, use the ${inlineQuote(`${prefix}module enable filter`)} command.`,
        ].filter(Boolean);

        return ctx.messageUtil.replyWithSuccess(
            message,
            `New phrase added`,
            `Successfully added ${inlineQuote(phrase)} with the severity ${inlineCode(severity.toLowerCase())} to the automod list!${additionalMessages.length ? `\n\n${additionalMessages.join("\n\n")}` : ""}`
        );
    },
};

export default Add;
