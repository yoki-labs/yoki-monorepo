import type { GEvent } from "../../typings";

export default {
    execute: async ([channel, ctx]) => {
        const server = await ctx.dbUtil.getServer(channel.serverId);

        // No server, ignore it
        if (!server)
            return;
        else if (server.modmailEnabled)
            await ctx.supportUtil.closeThreadIfExists(server, channel.id);

        // Delete logs that have the deleted channel; there is no way for them to log anymore
        return ctx.prisma.logChannel.deleteMany({
            where: {
                serverId: channel.serverId,
                channelId: channel.id,
            },
        });
    },
    name: "channelDeleted",
} satisfies GEvent<"channelDeleted">;
