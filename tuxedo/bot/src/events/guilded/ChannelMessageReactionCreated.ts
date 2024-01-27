import { MessageReaction } from "guilded.js";
import { TuxoClient } from "../../Client";
import { defaultGiveawayEmote } from "../../helpers/giveaway";
import { CurrencyEmoteAwait } from "../../helpers/lifetimed";
import { blackjackReactionHit, blackjackReactionStand, blackjackReactionStandAce1 } from "../../helpers/minigame";
import type { GEvent } from "../../typings";
import { inlineQuote } from "@yokilabs/bot";

export default {
    execute: async ([reaction, ctx]) => {
        const { serverId, channelId, messageId, emote, createdBy } = reaction;
        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server || createdBy === ctx.user?.id) return;

        // If it's an emote to join and there is an on-going giveaway
        if (emote.id === defaultGiveawayEmote) return ctx.giveawayUtil.addGiveawayParticipant(messageId, createdBy);
        else if (emote.id === blackjackReactionHit) return ctx.minigameUtil.addBlackjackHit(serverId, messageId, createdBy);
        else if (emote.id === blackjackReactionStand || emote.id === blackjackReactionStandAce1)
            return ctx.minigameUtil.addBlackjackStand(serverId, messageId, createdBy, emote.id === blackjackReactionStand);

        const currencyReaction = ctx.lifetimedUtil.awaitingCurrencyEmotes.find((x) => x.channelId == channelId && x.messageId == messageId);

        if (currencyReaction)
            return onIncomeCurrencyReaction(ctx, currencyReaction, reaction);

        return null;
    },
    name: "messageReactionCreated",
} satisfies GEvent<"messageReactionCreated">;

async function onIncomeCurrencyReaction(client: TuxoClient, awaitedCurrencyEmote: CurrencyEmoteAwait, messageReaction: MessageReaction) {
    await client.dbUtil.updateCurrency(awaitedCurrencyEmote.currency, {
        emote: messageReaction.emote.name,
        emoteId: messageReaction.emote.id,
    });

    return client.messageUtil.sendSuccessBlock(awaitedCurrencyEmote.channelId, `Currency emote set`, `The emote :${messageReaction.emote.name}: has been set as an emote icon for currency ${inlineQuote(awaitedCurrencyEmote.currency.name)}.`);
}