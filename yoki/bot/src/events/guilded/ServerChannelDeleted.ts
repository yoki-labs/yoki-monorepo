import type { GEvent } from "../../typings";

export default {
    execute: async ([channel, ctx]) => {
        // Delete logs that have the deleted channel; there is no way for them to log anymore
        await ctx.prisma.logChannel.deleteMany({
            where: {
                serverId: channel.serverId,
                channelId: channel.id,
            },
        });
    },
    name: "channelDeleted",
} satisfies GEvent<"channelDeleted">;
