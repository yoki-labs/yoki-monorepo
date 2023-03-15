import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";

export default {
    execute: async ([listItem, ctx]) => {
        const server = await ctx.dbUtil.getServer(listItem.serverId);
        const { id, channelId, createdBy, message, note, serverId } = listItem;

        // If it's a thread
        void ctx.amp.logEvent({ event_type: "LIST_ITEM_SCAN", user_id: createdBy, event_properties: { serverId } });
        if (server.filterEnabled)
            return ctx.contentFilterUtil.scanContent({
                userId: createdBy,
                text: note ? `${message}\n${note.content}` : message,
                filteredContent: FilteredContent.ChannelContent,
                channelId,
                server,
                resultingAction: () => ctx.lists.delete(channelId as string, id as string),
            });
    }, name: "listItemCreated"
} satisfies GEvent<"listItemCreated">;
