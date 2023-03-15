import { Member } from "guilded.js";

import { FilteredContent } from "../../modules/content-filter";
import type { GEvent } from "../../typings";

export default {
    execute: async ([newMember, _oldMember, ctx]) => {
        const isMember = newMember instanceof Member;
        const nickname = isMember ? newMember.nickname : newMember.userInfo.nickname;
        const userId = isMember ? newMember.id : newMember.userInfo.id;
        const server = await ctx.dbUtil.getServer(newMember.serverId);

        // if the member's nickname is updated, scan it for any harmful content
        if (nickname) {
            if (["!", "."].some((x) => nickname.trim().startsWith(x))) {
                void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId: newMember.serverId } });
                return ctx.members.updateNickname(newMember.serverId, userId, nickname.slice(1).trim() || "NON-HOISTING NAME");
            }

            return ctx.contentFilterUtil.scanContent({
                userId,
                text: nickname,
                filteredContent: FilteredContent.ServerContent,
                channelId: null,
                server,
                resultingAction: () => ctx.members.resetNickname(newMember.serverId, userId),
            });
        }
    },
    name: "memberUpdated"
} satisfies GEvent<"memberUpdated">;
