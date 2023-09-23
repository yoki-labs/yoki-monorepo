import { ServerChannelPayload } from "guilded.js";
import type { Server } from "../../typings";
import YokiClient from "../../Client";

export default async ({ d: { serverId, channel } }: { d: { serverId: string; channel: ServerChannelPayload } }, ctx: YokiClient, server: Server) => {
    if (server.modmailEnabled)
        await ctx.supportUtil.closeThreadIfExists(server, channel.id);

    // Delete logs that have the deleted channel; there is no way for them to log anymore
    return ctx.prisma.logChannel.deleteMany({
        where: {
            serverId: serverId,
            channelId: channel.id,
        },
    });
}