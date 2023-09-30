import { ServerChannelPayload } from "guilded.js";

import YokiClient from "../../Client";
import type { Server } from "../../typings";

export default async ({ d: { serverId, channel } }: { d: { serverId: string; channel: ServerChannelPayload } }, ctx: YokiClient, server: Server) => {
    if (server.modmailEnabled) await ctx.supportUtil.closeThreadIfExists(server, channel.id);

    // Delete logs that have the deleted channel; there is no way for them to log anymore
    return ctx.prisma.logChannel.deleteMany({
        where: {
            serverId,
            channelId: channel.id,
        },
    });
};
