import { defaultGiveawayEmote } from "../../helpers/giveaway";
import { blackjackReactionHit, blackjackReactionStand, blackjackReactionStandAce1 } from "../../helpers/minigame";
import type { GEvent } from "../../typings";

export default {
    execute: async ([reaction, ctx]) => {
        const { serverId, messageId, emote, createdBy } = reaction;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server || createdBy === ctx.user?.id) return;

        // If it's an emote to join and there is an on-going giveaway
        if (emote.id === defaultGiveawayEmote) return ctx.giveawayUtil.addGiveawayParticipant(messageId, createdBy);
        else if (emote.id === blackjackReactionHit) return ctx.minigameUtil.addBlackjackHit(serverId, messageId, createdBy);
        else if (emote.id === blackjackReactionStand || emote.id === blackjackReactionStandAce1)
            return ctx.minigameUtil.addBlackjackStand(serverId, messageId, createdBy, emote.id === blackjackReactionStand);
        return null;
    },
    name: "messageReactionCreated",
} satisfies GEvent<"messageReactionCreated">;
