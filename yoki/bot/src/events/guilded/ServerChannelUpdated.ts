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
            if (!member) return;

            return moderateContent({
                ctx,
                server,
                channelId: channel.id,
                member,
                contentType: ContentIgnoreType.THREAD,
                filteredContent: FilteredContent.ChannelContent,
                content: channel.name,
                mentions: undefined,
                resultingAction: () => ctx.channels.delete(channel.id),
            });
        }

        return null;
    },
    name: "channelUpdated",
} satisfies GEvent<"channelUpdated">;
