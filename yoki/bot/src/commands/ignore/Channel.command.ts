import type { ChannelIgnoreType } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";
import type { Channel } from "guilded.js";

import { ResolvedEnum, RoleType } from "../../typings";
import { Category, Command } from "../commands";
import { ChannelIgnoreSettingAction, ChannelIgnoreTypeMap } from "./filterenum";

const IgnoreChannel: Command = {
    name: "ignore-channel",
    description: "Set channels ignored by the automod filter.",
    // usage: "<channel-id> <url/invite/automod> [remove]",
    examples: ["#offtopic-channel url", "#general automod remove"],
    category: Category.Filter,
    subCommand: true,
    subName: "channel",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "channel", type: "channel" },
        { name: "type", type: "enum", display: "url / invite / automod", values: ChannelIgnoreTypeMap },
        { name: "action", type: "enum", optional: true, values: ChannelIgnoreSettingAction },
    ],
    execute: async (message, args, ctx) => {
        const channel = args.channel as Channel;
        const ignoreType = (args.type as ResolvedEnum).resolved as ChannelIgnoreType;
        const action = (args.action as ResolvedEnum | null)?.resolved as ChannelIgnoreSettingAction | null;

        const existingAlready = Boolean(await ctx.prisma.channelIgnore.findFirst({ where: { serverId: message.serverId!, channelId: channel.id, type: ignoreType } }));

        // existingAlready ^ (action === "REMOVE")
        if (existingAlready && action !== "REMOVE") return ctx.messageUtil.replyWithError(message, "Already exists", "That filtering ignore has already been added!");
        if (!existingAlready && action === "REMOVE") return ctx.messageUtil.replyWithError(message, "Doesn't exist", "That filtering ignore does not exist and cannot be removed!");

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
