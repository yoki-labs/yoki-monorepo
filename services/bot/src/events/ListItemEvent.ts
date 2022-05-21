import type { WSListItemCreated } from "@guildedjs/guilded-api-typings";

import { FilteredContent } from "../modules/content-filter";
import type { Context, Server } from "../typings";

export default async (event: WSListItemCreated, ctx: Context, server: Server) => {
    const {
        listItem: { id, channelId, createdBy, message, note },
    } = event.d;

    // If it's a thread
    return ctx.contentFilterUtil.scanContent(createdBy, note ? `${message}\n${note.content}` : message, FilteredContent.ChannelContent, channelId, server, () =>
        ctx.rest.router.deleteListItem(channelId as string, id as string)
    );
};
