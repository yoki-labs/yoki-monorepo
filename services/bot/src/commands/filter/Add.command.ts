import { optionKeys, transformSeverityStringToEnum } from "../../functions/content-filter";
import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Add: Command = {
    name: "filter-add",
    subName: "add",
    description: "Add a word or phrase to the automod filter",
    usage: "<phrase> [severity=warn] [infraction_points=5]",
    examples: ["test_word warn", "test_word_2 kick"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "phrase",
            type: "string",
        },
        {
            name: "severity",
            type: "string",
            optional: true,
        },
        {
            name: "infraction_points",
            type: "number",
            optional: true,
        },
    ],
    execute: async (message, args, { prisma, messageUtil, contentFilterUtil }, { server }) => {
        if (!server.filterEnabled)
            return messageUtil.send(message.channelId, `Automod filter is disabled! Please enable using \`${server.prefix ?? process.env.DEFAULT_PREFIX}filter enable\``);
        const phrase = args.phrase as string;
        const severity = (args.severity as string | null) ?? "warn";
        const infractionPoints = (args.infraction_points as number | null) ?? 5;

        if (!optionKeys.includes(severity)) return messageUtil.send(message.channelId, "Sorry, but that is not a valid severity level!");
        if (infractionPoints < 0 || infractionPoints > 100) return messageUtil.send(message.channelId, "Sorry, but the infraction points must be between 0 and 100.");
        const doesExistAlready = await prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (doesExistAlready) return messageUtil.send(message.channelId, "This word is already in your server's filter!");
        await contentFilterUtil.addWordToFilter({
            content: phrase,
            creatorId: message.createdBy,
            serverId: message.serverId!,
            severity: transformSeverityStringToEnum(severity),
            infractionPoints,
        });
        return messageUtil.send(message.channelId, `Successfully added \`${phrase}\` with the severity \`${severity}\` to the automod list!`);
    },
};

export default Add;
