import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";

export default {
    execute: async ([event, ctx]) => {
        const { nickname, userId, serverId } = event;
        const server = await ctx.dbUtil.getServer(serverId);

        // if the member's nickname is updated, scan it for any harmful content
        if (nickname) {
            if (["!", "."].some((x) => nickname.trim().startsWith(x))) {
                void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId } });
                return ctx.members.updateNickname(serverId, userId, nickname.slice(1).trim() || "NON-HOISTING NAME");
            }

            return ctx.contentFilterUtil.scanContent({
                userId,
                text: nickname,
                filteredContent: FilteredContent.ServerContent,
                channelId: null,
                server,
                resultingAction: () => ctx.members.resetNickname(serverId, userId),
            });
        }
    },
    name: "memberUpdated"
} satisfies GEvent<"memberUpdated">;
