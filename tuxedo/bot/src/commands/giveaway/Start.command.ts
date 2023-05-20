import { inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { stripIndents } from "common-tags";

const defaultJoinEmote = 90002569;

const Start: Command = {
    name: "giveaway-start",
    description: "Creates a new giveaway",
    usage: "",
    subName: "start",
    subCommand: true,
    category: Category.Events,
    // requiredRole: RoleType.MOD,
    args: [
        {
            name: "time",
            type: "string",
        },
        {
            name: "winners",
            type: "number"
        },
        {
            name: "text",
            type: "rest"
        }
    ],
    execute: async (message, _args, ctx) => {
        const time = _args.time as string;
        const text = _args.text as string;
        const winners = _args.winners as number;

        // // To not trash the channel with giveaway commands
        // await message.delete();

        const giveawayMessage = await ctx.messageUtil.sendInfoBlock(
            message.channelId,
            ":tada: Giveaway has started!",
            text,
            {
                fields: [
                    {
                        name: "Information",
                        value: stripIndents`
                            **Possible winner count:** ${inlineCode(winners)}
                            **Ends in:** ${time} (${time} left)
                            **Giveaway ID:** ${inlineCode("ExampleID")}
                        `,
                        inline: true
                    },
                    {
                        name: "How to Join",
                        value: `React with :plus1: to join the giveaway!`,
                        inline: true
                    }
                ],
            },
            {
                isSilent: true
            }
        );

        return giveawayMessage.addReaction(defaultJoinEmote);
    },
};

export default Start;
