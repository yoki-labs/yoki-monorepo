import { channelName, inlineCode } from "@yokilabs/bot";
import type { Channel as GChannel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Channel: Command = {
    name: "appeal-channel",
    description: "Set or view the channel where appeals are sent.",
    // usage: "[channel-id]",
    examples: ["#appeals-channel"],
    category: Category.Appeal,
    subCommand: true,
    subName: "channel",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "channel", type: "channel", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const channel = args.channel as GChannel | null;
        if (!channel) {
            const fetchedChannel = commandCtx.server.appealChannelId
                ? await ctx.channels.fetch(commandCtx.server.appealChannelId).catch(() => commandCtx.server.appealChannelId)
                : null;
            return ctx.messageUtil.replyWithInfo(
                message,
                "Appeal channel",
                typeof fetchedChannel === "string"
                    ? `Looks like the channel was deleted or I cannot access it. The current channel set has the ID of ${inlineCode(fetchedChannel)}`
                    : fetchedChannel
                    ? channelName(fetchedChannel.name, fetchedChannel.serverId, fetchedChannel.groupId, fetchedChannel.id)
                    : "not set"
            );
        }

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { appealChannelId: channel.id } });
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Appeal channel successfully set",
            `You have now set the appeal channel to \`${
                channel.name
            }\`. Users will be able to appeal bans to your server through [this](https://yoki.gg/appeals/${message.serverId!}) url.`
        );
    },
};

export default Channel;
