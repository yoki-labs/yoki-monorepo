import { type Channel, ChannelType } from "guilded.js";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const WelcomeChannel: Command = {
    name: "welcome-channel",
    subName: "channel",
    description: "Select a channel where welcome messages will be sent to.",
    // usage: "<channel-id> <message-id> <emote-id>",
    examples: ["#Welcome"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Entry,
    args: [
        {
            name: "channel",
            display: "welcome channel",
            type: "channel",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        if (!server.flags.includes("EARLY_ACCESS")) return ctx.messageUtil.replyWithUnpermitted(message, `This feature is not enabled for this server. Come back later!`);

        const channel = args.channel as Channel;

        if (channel.type !== ChannelType.Chat)
            return ctx.messageUtil.replyWithError(message, `Not a chat channel`, `The provided channel is of incorrect content type. Chat channel was expected.`);

        await ctx.prisma.server.update({ where: { serverId: message.serverId! }, data: { welcomeChannel: channel.id } });

        return ctx.messageUtil.replyWithSuccess(message, "Welcome channel set", `Welcome messages will now be sent to \`${channel.name}\`.`);
    },
};

export default WelcomeChannel;
