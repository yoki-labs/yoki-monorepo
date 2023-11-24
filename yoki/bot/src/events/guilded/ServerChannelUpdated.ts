import { ContentIgnoreType } from "@prisma/client";

import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";
import { moderateContent } from "../../utils/moderation";

export default {
    execute: async ([channel, _, ctx]) => {
        const { serverId } = channel;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // Only if it's a thread; parentId instead of messageId, because it can filter list threads too
        if ((channel.raw as { id: string; parentId: string }).parentId) {
            const member = await ctx.members.fetch(serverId, channel.createdBy).catch(() => null);

            return moderateContent(
                ctx,
                server,
                channel.id,
                ContentIgnoreType.THREAD,
                FilteredContent.Channel,
                channel.createdBy,
                member?.roleIds ?? [],
                // To moderate forum titles as well
                channel.name,
                undefined,
                () => ctx.channels.update(channel.id, { name: "Filtered thread name" })
            );
        }
    },
    name: "channelUpdated",
} satisfies GEvent<"channelUpdated">;
