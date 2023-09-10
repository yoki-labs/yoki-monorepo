import { defaultGiveawayEmote } from "../../helpers/giveaway";
import type { GEvent } from "../../typings";

export default {
    execute: async ([reaction, ctx]) => {
        const { serverId, messageId, emote, createdBy } = reaction;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        // If it's an emote to join and there is an on-going giveaway
        if (createdBy !== ctx.user?.id && emote.id === defaultGiveawayEmote) ctx.giveawayUtil.removeGiveawayParticipant(messageId, createdBy);
    },
    name: "messageReactionDeleted",
} satisfies GEvent<"messageReactionDeleted">;
