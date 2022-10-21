import type { ServerChannelPayload } from "@guildedjs/guilded-api-typings";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Channel: Command = {
    name: "antiraid-channel",
    description: "Set or view the channel where users are presented with challenges if they fail the age filter.",
    usage: "[channel-id]",
    examples: ["c8a6286c-557d-4909-9ae1-a2bb64e3d72f"],
    category: Category.Antiraid,
    subCommand: true,
    subName: "channel",
    requiredRole: RoleType.ADMIN,
    args: [{ name: "channel", type: "channel", optional: true }],
    execute: async (message, args, ctx, commandCtx) => {
        const channel = args.channel as ServerChannelPayload | null;
        if (!channel) return ctx.messageUtil.replyWithInfo(message, "Challenge channel", commandCtx.server.antiRaidChallengeChannel ?? "not set");

        await ctx.prisma.server.update({ where: { id: commandCtx.server.id }, data: { antiRaidChallengeChannel: channel.id } });
        return ctx.messageUtil.replyWithSuccess(message, "Challenge channel successfully set", `You have now set the challenge channel to \`${channel.name}\``);
    },
};

export default Channel;
