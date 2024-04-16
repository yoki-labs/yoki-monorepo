import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";

export default {
    execute: async ([listItem, _oldListItem, ctx]) => {
        const server = await ctx.dbUtil.getServer(listItem.serverId, false);
        if (!server) return;

        const { id, channelId, createdBy, message, note, serverId } = listItem;
        const member = await ctx.members.fetch(serverId, createdBy).catch(() => null);
        if (!member) return;

        // If it's a thread
        void ctx.amp.logEvent({ event_type: "LIST_ITEM_SCAN", user_id: createdBy, event_properties: { serverId } });
        if (server.filterEnabled)
            return ctx.contentFilterUtil.scanContent({
                member,
                text: note ? `${message}\n${note.content}` : message,
                filteredContent: FilteredContent.ChannelContent,
                channelId,
                server,
                resultingAction: () => ctx.lists.delete(channelId as string, id as string),
            });
        return null;
    },
    name: "listItemUpdated",
} satisfies GEvent<"listItemUpdated">;
