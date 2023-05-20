import { ChannelIgnoreType, ContentIgnoreType } from "@prisma/client";

import { ResolvedEnum, RoleType } from "../../typings";
import { Category, Command } from "../commands";
import { ChannelIgnoreSettingAction, ChannelIgnoreTypeMap } from "./filterenum";

const IgnoreContent: Command = {
    name: "ignore-content",
    description: "Set channel content ignored by the automod filter.",
    // usage: "<contentType> <type> [remove]",
    examples: ["message automod", "forum_topic automod remove"],
    category: Category.Filter,
    subCommand: true,
    subName: "content",
    requiredRole: RoleType.ADMIN,
    args: [
        { name: "contentType", display: "content type", type: "enum", values: ContentIgnoreType },
        { name: "type", display: "module to ignore", type: "enum", values: ChannelIgnoreTypeMap },
        { name: "action", display: "remove", type: "enum", optional: true, values: ChannelIgnoreSettingAction },
    ],
    execute: async (message, args, ctx) => {
        const contentType = (args.contentType as ResolvedEnum).resolved as ContentIgnoreType;
        const ignoreType = (args.type as ResolvedEnum).resolved as ChannelIgnoreType;
        const action = (args.action as ResolvedEnum | null)?.resolved as ChannelIgnoreSettingAction | null;

        const existingAlready = Boolean(await ctx.prisma.channelIgnore.findFirst({ where: { serverId: message.serverId!, type: ignoreType, contentType } }));

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
        const contentTypeName = contentType.split("_").join(" ");

        if (action === "REMOVE") {
            await ctx.prisma.channelIgnore.deleteMany({ where: { serverId: message.serverId!, type: ignoreType, contentType } });
            return ctx.messageUtil.replyWithSuccess(message, "Filtering ignore removed", `The ignore for ${what} in ${contentTypeName}s has been removed`);
        }

        await ctx.prisma.channelIgnore.create({ data: { serverId: message.serverId!, type: ignoreType, contentType } });

        return ctx.messageUtil.replyWithSuccess(message, "Filtering ignore added", `Yoki will no longer filter ${what} in ${contentTypeName}s.`);
    },
};

export default IgnoreContent;
