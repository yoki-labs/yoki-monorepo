import { Colors, inlineCode } from "@yokilabs/bot";
import { Embed, Member } from "guilded.js";

import { Category, Command } from "../commands";

const Money: Command = {
    name: "money",
    description: "View economical information about a user or yourself.",
    examples: ["0mqNyllA"],
    aliases: ["balance", "m"],
    category: Category.Income,
    args: [
        {
            name: "target",
            display: "user",
            type: "member",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const target = (args.target as Member) ?? (await message.client.members.fetch(message.serverId!, message.authorId));

        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);
        const userInfo = await ctx.dbUtil.getServerMember(message.serverId!, target.id);

        const currencyLines = userInfo ? currencies.filter(x => x.id in (userInfo.balance as Record<string, number>)).map(x => `${(userInfo.balance as Record<string, number>)[x.id]} ${x.name}`) : null;

        return ctx.messageUtil.send(message.channelId, {
            embeds: [
                new Embed()
                    .setTitle(`${target.isOwner ? ":crown: " : ""}<@${target.user!.id}> (${inlineCode(target.user!.id)})`)
                    .setColor(Colors.blockBackground)
                    .setDescription(
                        `Info about user's server balance/finances.`
                    )
                    .addFields([
                        {
                            name: "Balance",
                            value: currencyLines?.length ? currencyLines.join("\n") : "User has no server currency.",
                        },
                    ])
                    .setThumbnail(target.user!.avatar!)
                    .toJSON(),
            ],
            isSilent: true,
        });
    },
};

export default Money;
