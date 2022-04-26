import Embed from "@guildedjs/embeds";
import { stripIndents } from "common-tags";

import { isHashId } from "../../util";
import { Category } from "../Category";
import type { Command } from "../Command";
import { RoleType } from ".prisma/client";

const Warning: Command = {
    name: "warn",
    description: "Warns the user about certain action and logs it into the history",
    usage: "<targetId> <...reason>",
    requiredRole: RoleType.MOD,
    category: Category.Moderation,
    args: [
        {
            name: "targetId",
            type: "string",
        },
        {
            name: "reason",
            type: "rest",
        },
    ],
    examples: ["R40Mp0Wd Plays Town of Salem"],
    async execute(message, args, ctx, commandCtx) {
        const targetId: string = args.targetId as string;
        const reason: string = args.reason as string;

        if (!isHashId(targetId))
            return ctx.messageUtil.send(message.channelId, {
                content: stripIndents`
                    Please provide the identifier of the user as \`targetId\`
                `,
                replyMessageIds: [message.id],
            });

        const newAction = await ctx.serverUtil.addAction({
            serverId: message.serverId!,
            executorId: message.createdBy,
            infractionPoints: 5,
            reason,
            triggerWord: null,
            targetId,
            type: "WARN",
            expiresAt: null,
        });

        await ctx.serverUtil.sendModLogMessageIfPossible(message.serverId!, commandCtx.member, newAction);

        return ctx.rest.router.createChannelMessage(message.channelId, {
            content: "A new warning has been issued.",
            isPrivate: true,
            embeds: [
                new Embed({
                    title: "You have been warned",
                    description: `<@${targetId}>, you have been manually warned by a staff member of this server.`,
                }).addField("Reason", reason.length > 1021 ? `${reason.substr(0, 1021)}...` : reason),
            ],
        });
    },
};
export default Warning;

declare module "@guildedjs/guilded-api-typings" {
    export interface ChatMessageContent {
        isPrivate?: boolean;
        isSilent?: boolean;
        replyMessageIds?: string[];
        content: string;
        embeds?: Embed[];
    }
}
