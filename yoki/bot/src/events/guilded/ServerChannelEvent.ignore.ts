import { ContentIgnoreType } from "@prisma/client";
import { Channel } from "guilded.js";

import YokiClient from "../../Client";
import { FilteredContent } from "../../modules/content-filter";
import { moderateContent } from "../../utils/moderation";

export default async function ServerChannelEvent(ctx: YokiClient, channel: Channel) {
    const { serverId } = channel;

    const server = await ctx.dbUtil.getServer(serverId, false);
    if (!server) return;

    // Only if it's a thread; parentId instead of messageId, because it can filter list threads too
    if (!(channel.raw as { id: string; parentId: string }).parentId) return;

    // Scanning
    await moderateContent(
        ctx,
        server,
        channel.id,
        ContentIgnoreType.THREAD,
        FilteredContent.Channel,
        channel.createdBy,
        // To moderate forum titles as well
        channel.name,
        undefined,
        () => ctx.channels.update(channel.id, { name: "Filtered thread name" })
    );
}
