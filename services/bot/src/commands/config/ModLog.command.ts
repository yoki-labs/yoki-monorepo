import { LogChannelType } from "../../typings";
import type { Command } from "../Command";

const Modlog: Command = {
    name: "config-modlog",
    description: "Set or view the mod log channel for this server.",
    usage: "modlog [newChannel]",
    subCommand: true,
    subName: "modlog",
    aliases: ["mod-log", "modlogs", "mod-logs"],
    args: [{ name: "newChannel", optional: true, type: "string" }],
    execute: async (message, args, ctx) => {
        const newChannel = args.newChannel as string;
        // if (newChannel && !isUUID(newChannel)) return ctx.messageUtil.send(message.channelId, "Oh no! That is not a valid channel ID.");

        if (!newChannel) {
            const modLogChannel = await ctx.serverUtil.getModLogChannel(message.serverId!);
            return ctx.messageUtil.send(
                message.channelId,
                modLogChannel ? `The modlogs channel is set to: \`${modLogChannel!.channelId}\`` : `There is no modlogs channel set.`
            );
        }

        const newModLogsChannel = await ctx.prisma.logChannel.create({
            data: {
                channelId: newChannel,
                serverId: message.serverId!,
                type: LogChannelType.MOD_ACTION_LOG,
            },
        });
        return ctx.messageUtil.send(message.channelId, `Successfully set the modlogs channel to \`${newModLogsChannel.channelId}\``);
    },
};

export default Modlog;
