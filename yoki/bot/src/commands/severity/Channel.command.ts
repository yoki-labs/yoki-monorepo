import { channelName, inlineCode } from "@yokilabs/bot";
import type { Channel as GChannel } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const Channel: Command = {
    name: "severity-channel",
    description: "Set or view the channel where mod action messages to offending users are sent.",
    // usage: "[channel-id]",
    examples: ["#action-channel"],
    category: Category.Settings,
    subCommand: true,
    subName: "channel",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "channel", type: "channel", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const channel = args.channel as GChannel | null;

        if (!channel) {
            const fetchedChannel = commandCtx.server.actionNotificationChannel
                ? await ctx.channels.fetch(commandCtx.server.actionNotificationChannel).catch(() => commandCtx.server.appealChannelId)
                : null;
            return ctx.messageUtil.replyWithInfo(
                message,
                "Action channel",
                typeof fetchedChannel === "string"
                    ? `Looks like the channel was deleted or I cannot access it. The current channel set has the ID of ${inlineCode(fetchedChannel)}`
                    : fetchedChannel
                    ? channelName(fetchedChannel.name, fetchedChannel.serverId, fetchedChannel.groupId, fetchedChannel.id)
                    : "not set"
            );
        }

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { actionNotificationChannel: channel.id } });
        return ctx.messageUtil.replyWithSuccess(message, "Action channel successfully set", `You have now set the action notification channel to \`${channel.name}\`.`);
    },
};

export default Channel;
