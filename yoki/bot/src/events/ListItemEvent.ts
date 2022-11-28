import type { WSListItemCreated } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (event: WSListItemCreated, ctx: Context, server: Server) => {
    const {
        "listItem": { id, channelId, createdBy, message, note, serverId },
    } = event.d;

    // If it's a thread
    void ctx.amp.logEvent({ event_type: "LIST_ITEM_SCAN", user_id: createdBy, event_properties: { serverId } });
    if (server.filterEnabled)
        return ctx.contentFilterUtil.scanContent({
            userId: createdBy,
            text: note ? `${message}\n${note.content}` : message,
            filteredContent: FilteredContent.ChannelContent,
            channelId,
            server,
            resultingAction: () => ctx.rest.router.deleteListItem(channelId as string, id as string),
        });
};
