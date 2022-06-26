import type { WSListItemCreated } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (event: WSListItemCreated, ctx: Context, server: Server) => {
    const {
        listItem: { id, channelId, createdBy, message, note },
    } = event.d;

    // If it's a thread
    return ctx.contentFilterUtil.scanContent({
        userId: createdBy,
        text: note ? `${message}\n${note.content}` : message,
        filteredContent: FilteredContent.ChannelContent,
        channelId,
        server,
        resultingAction: () => ctx.rest.router.deleteListItem(channelId as string, id as string),
    });
};
