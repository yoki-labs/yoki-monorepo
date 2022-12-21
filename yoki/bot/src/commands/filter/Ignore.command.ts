import type { ServerChannelPayload } from "@guildedjs/guilded-api-typings";
import { ChannelIgnoreType } from "@prisma/client";

import { RoleType } from "../../typings";
import { listInlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";

const Ignore: Command = {
    name: "filter-ignore",
    description: "Set or view channels ignored by the automod filter.",
    usage: "[channel-id]",
    examples: ["#offtopic-channel"],
    category: Category.Filter,
    subCommand: true,
    subName: "ignore",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channel", type: "channel", optional: true },
        { name: "action", type: "string", optional: true },
    ],
    execute: async (message, args, ctx) => {
        const channel = args.channel as ServerChannelPayload | null;
        const action = args.action as string | null;

        if (!channel) {
            const dbChannels = await ctx.prisma.channelIgnore.findMany({ where: { serverId: message.serverId! } });
            return ctx.messageUtil.replyWithInfo(message, "Ignored channels by ID", listInlineCode(dbChannels.map((x) => x.channelId ?? x.contentType!.toLowerCase())));
        }

        if (action?.toLowerCase().trim() === "remove") {
            await ctx.prisma.channelIgnore.deleteMany({ where: { channelId: channel.id } });
        } else {
            const existingAlready = await ctx.prisma.channelIgnore.findFirst({ where: { serverId: message.serverId!, channelId: message.channelId } });
            if (existingAlready)
                return ctx.messageUtil.replyWithError(
                    message,
                    "The bot is already ignoring this channel",
                    'You have already marked this channel to be ignored by the automod filter. If you wish for it to not be ignored, you can run this command again with "remove" at the end of it.'
                );

            await ctx.prisma.channelIgnore.create({ data: { channelId: message.channelId, serverId: message.serverId!, type: ChannelIgnoreType.AUTOMOD } });
        }
        return ctx.messageUtil.replyWithSuccess(
            message,
            "Successfully marked channel as ignored",
            `The bot will no longer scan messages in this channel. You can undo this by running the command again with \"remove\" at the end of it.`
        );
    },
};

export default Ignore;
