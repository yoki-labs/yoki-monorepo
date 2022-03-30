import { optionKeys, transformSeverityStringToEnum } from "../../functions/content-filter";
import type { Command } from "../Command";

const Add: Command = {
    name: "filter-add",
    subName: "add",
    description: "Add a word or phrase to the automod filter",
    usage: "<word-to-ban> [severity=warn]",
    examples: ["test_word warn", "test_word_2 kick"],
    subCommand: true,
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
    ],
    execute: async (message, args, _commandCtx, { prisma, messageUtil, contentFilterUtil }) => {
        const phrase = args.phrase as string;
        const severity = (args.severity as string) ?? "warn";
        if (!optionKeys.includes(severity)) return messageUtil.send(message.channelId, "Sorry, but that is not a valid severity level!");
        const doesExistAlready = await prisma.contentFilter.findFirst({ where: { serverId: message.serverId!, content: phrase } });
        if (doesExistAlready) return messageUtil.send(message.channelId, "This word is already in your server's filter!");
        await contentFilterUtil.addWordToFilter({
            content: phrase,
            creatorId: message.createdBy,
            serverId: message.serverId!,
            severity: transformSeverityStringToEnum(severity),
        });
        return messageUtil.send(message.channelId, `Successfully added \`${phrase}\` with the severity \`${severity}\` to the automod list!`);
    },
};

export default Add;
