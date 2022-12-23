import type { ServerChannelPayload } from "@guildedjs/guilded-api-typings";
import type { ChannelIgnoreType } from "@prisma/client";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { Category } from "../Category";
import type { Command } from "../Command";
import { ChannelIgnoreSettingAction, ChannelIgnoreTypeMap } from "./filterenum";

const IgnoreChannel: Command = {
    name: "ignore-channel",
    description: "Set channels ignored by the automod filter.",
    usage: "<channel-id> <url/invite/automod> [remove]",
    examples: ["#offtopic-channel url", "#general automod remove"],
    category: Category.Filter,
    subCommand: true,
    subName: "channel",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channel", type: "channel" },
        { name: "type", type: "enum", values: ChannelIgnoreTypeMap },
        { name: "action", type: "enum", optional: true, values: ChannelIgnoreSettingAction },
    ],
    execute: async (message, args, ctx) => {
        const channel = args.channel as ServerChannelPayload;
        const ignoreType = args.type as ChannelIgnoreType;
        const action = args.action as ChannelIgnoreSettingAction | null;

        const existingAlready = Boolean(await ctx.prisma.channelIgnore.findFirst({ where: { serverId: message.serverId!, channelId: channel.id, type: ignoreType } }));

        // When JavaScript is convenient, TypeScript gets in the way
        // When JavaScript is inconvenient, TypeScript ignores it
        // Though, I guess it makes sense why.
        // exists already ^ is remove == 0
        // doesnt exist ^ is not remove == 0
        // exists already ^ isnt remove == 1
        // doesnt exist ^ is remove == 1
        // The 1 is not right
        if ((existingAlready as unknown as number) ^ ((action === "REMOVE") as unknown as number))
            return existingAlready
                ? ctx.messageUtil.replyWithError(message, "Already exists", "That filtering ignore has already been added!")
                : ctx.messageUtil.replyWithError(message, "Doesn't exist", "That filtering ignore does not exist and cannot be removed!");

        const what = ignoreType === "AUTOMOD" ? "phrases" : ignoreType === "INVITE" ? "invites" : "URLs";

        if (action === "REMOVE") {
            await ctx.prisma.channelIgnore.deleteMany({ where: { channelId: channel.id, type: ignoreType } });
            return ctx.messageUtil.replyWithSuccess(message, "Filtering ignore removed", `The channel ignore for ${what} has been removed`);
        }

        await ctx.prisma.channelIgnore.create({ data: { channelId: channel.id, serverId: message.serverId!, type: ignoreType } });

        return ctx.messageUtil.replyWithSuccess(message, "Filtering ignore added", `Yoki will no longer filter ${what} in the channel ${inlineCode(channel.name)}.`);
    },
};

export default IgnoreChannel;
