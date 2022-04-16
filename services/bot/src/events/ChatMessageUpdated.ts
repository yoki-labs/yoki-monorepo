import type { WSChatMessageUpdatedPayload } from "@guildedjs/guilded-api-typings";

import type { Context } from "../typings";

export default async (packet: WSChatMessageUpdatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    // FIXME: Function for this
    let serverFromDb = await ctx.serverUtil.getServerFromDatabase(message.serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;
    if (!serverFromDb) serverFromDb = await ctx.serverUtil.createFreshServerInDatabase(message.serverId);

    if (!message.content.startsWith(serverFromDb.prefix ?? process.env.DEFAULT_PREFIX)) {
        await ctx.messageUtil.logMessage(message);
        return ctx.contentFilterUtil.scanMessage(message, serverFromDb);
    }

    return void 0;
};
