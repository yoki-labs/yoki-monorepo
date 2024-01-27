import { Currency } from "@prisma/client";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { EmbedField, EmbedPayload, Message } from "guilded.js";

import { BlackjackCondition, BlackjackDeck, randomBlackjackNumToCard, SpecialBlackjackVariant, stringifyBlackjackDeck, stringifyCard } from "../util/blackjack";
import { TuxoClient } from "../Client";
import { Util } from "@yokilabs/bot";

interface BlackjackInstance {
    serverId: string;
    channelId: string;
    messageId: string;
    createdAt: number;
    createdBy: string;
    amount: number;
    currencyId: string;
    currencyStartingBalance: number | null;
    deck: BlackjackDeck;
    dealerDeck: BlackjackDeck;
}

// :point_down:
export const blackjackReactionHit = 90001110;
// :white_check_mark:
export const blackjackReactionStand = 90002171;
// :ballot_box_with_check:
export const blackjackReactionStandAce1 = 90002172;

export class MinigameUtil extends Util<TuxoClient> {
    blackJackInstances: BlackjackInstance[] = [];

    getBlackjackInstanceIndex(serverId: string, messageId: string) {
        return this.blackJackInstances.findIndex((x) => x.serverId === serverId && x.messageId === messageId);
    }

    async addBlackjackHit(serverId: string, messageId: string, createdBy: string) {
        const instanceIndex = this.getBlackjackInstanceIndex(serverId, messageId);

        // Ignore it automatically; probably a random reaction
        if (instanceIndex < 0) return;

        const instance = this.blackJackInstances[instanceIndex];

        // Can't play for others
        if (instance.createdBy !== createdBy) return;

        // It's a hit, so another card should get added
        const newCard = this.getCard();
        // To add a reaction if necessary
        const previousDeckHadAces = instance.deck.find((x) => x === SpecialBlackjackVariant.Ace);

        instance.deck.push(newCard);

        const currentDeckValue = this.getDeckValue(instance.deck);

        let condition: BlackjackCondition = BlackjackCondition.Playing;

        const dealerDeckValue = this.getDealerDeckValue(instance.dealerDeck);

        // Deck is a bust; the max is 21 as your num and even with aces being 1 it's over 21
        if (currentDeckValue > 21) {
            condition = BlackjackCondition.Lost;
            // It's done
            this.blackJackInstances.splice(instanceIndex, 1);

            // Remove balance
            return Promise.all([this.updateBlackjackMessage(instance, currentDeckValue, dealerDeckValue, BlackjackCondition.Lost), this.updateBlackjackPlayer(instance, -1)]);
        } else if (currentDeckValue === 21 && dealerDeckValue === 21) {
            this.blackJackInstances.splice(instanceIndex, 1);

            return this.updateBlackjackMessage(instance, currentDeckValue, dealerDeckValue, BlackjackCondition.NeutralPush);
        } else if (currentDeckValue === 21) {
            this.blackJackInstances.splice(instanceIndex, 1);

            return Promise.all([this.updateBlackjackMessage(instance, currentDeckValue, dealerDeckValue, BlackjackCondition.Won), this.updateBlackjackPlayer(instance, 1)]);
        }
        // To add new reaction for hit with ace values
        else if (!previousDeckHadAces && newCard === SpecialBlackjackVariant.Ace)
            await this.client.reactions.create(instance.channelId, instance.messageId, blackjackReactionStandAce1);

        return this.updateBlackjackMessage(instance, currentDeckValue, 0, condition);
    }

    async addBlackjackStand(serverId: string, messageId: string, createdBy: string, acesAre11: boolean) {
        const instanceIndex = this.getBlackjackInstanceIndex(serverId, messageId);

        // Ignore it automatically; probably a random reaction
        if (instanceIndex < 0) return;

        const instance = this.blackJackInstances[instanceIndex];

        // Can't play for others
        if (instance.createdBy !== createdBy) return;

        // User chose how much aces are
        const userAceCount = instance.deck.filter((card) => card === SpecialBlackjackVariant.Ace).length;

        // Decided that it's additional check that doesn't matter

        // // Wrong reaction; no aces to use that action (I literally mean no aces, not no access)
        // if (!userAceCount && !acesAre11)
        //     return;

        const userDeckValue1 = this.getDeckValue(instance.deck);
        const userDeckValue11 = userDeckValue1 + userAceCount * 10;

        // // While they are using a button for aces to be 1 and it would be below 21,
        // // just use the normal stand reaction
        // if (userDeckValue11 > 21 && !acesAre11)
        //     return;

        const userDeckValue = userDeckValue11 > 21 || !acesAre11 ? userDeckValue1 : userDeckValue11;

        // const dealerAceCount = instance.dealerDeck.filter((card) => card === SpecialBlackjackVariant.Ace).length;
        // // Have to remember which value aces are (1 or 11)
        // const dealerDeckValueAce1 = this.getDeckValue(instance.dealerDeck);
        // const dealerDeckValueAce11 = this.getDeckValue(instance.dealerDeck) + (dealerAceCount * 10);
        // const dealerDeckValue = dealerDeckValueAce11 > 21 ? dealerDeckValueAce1 : dealerDeckValueAce11;
        const dealerDeckValue = this.getDealerDeckValue(instance.dealerDeck);

        this.blackJackInstances.splice(instanceIndex, 1);

        // After standing, dealer has 2 cards and draws until they hit 17 or more;
        // we have already done it at the start and now need to see if they bust
        if (dealerDeckValue > 21 || userDeckValue > dealerDeckValue)
            return Promise.all([this.updateBlackjackMessage(instance, userDeckValue, dealerDeckValue, BlackjackCondition.Won), this.updateBlackjackPlayer(instance, 1)]);
        else if (userDeckValue < dealerDeckValue)
            return Promise.all([this.updateBlackjackMessage(instance, userDeckValue, dealerDeckValue, BlackjackCondition.Lost), this.updateBlackjackPlayer(instance, -1)]);
        return this.updateBlackjackMessage(instance, userDeckValue, dealerDeckValue, BlackjackCondition.NeutralPush);
    }

    async updateBlackjackPlayer(instance: BlackjackInstance, receivedAmountMultiplier: number) {
        const memberBalance = await this.client.dbUtil.getServerMember(instance.serverId, instance.createdBy);
        const currentBalance = memberBalance?.balances.find((x) => x.currencyId === instance.currencyId);

        return this.client.dbUtil.updateMemberBalance(instance.serverId, instance.createdBy, memberBalance, [
            {
                currencyId: instance.currencyId,
                pocket: (currentBalance?.pocket ?? 0) + receivedAmountMultiplier * instance.amount,
                bank: currentBalance?.bank ?? instance.currencyStartingBalance ?? 0,
            },
        ]);
    }

    updateBlackjackMessage(instance: BlackjackInstance, deckValue: number, dealerDeckValue: number, condition: BlackjackCondition) {
        return this.client.messages.update(instance.channelId, instance.messageId, {
            embeds: [this.createBlackjackEmbed(instance.createdBy, instance.deck, instance.dealerDeck, deckValue, dealerDeckValue, condition)],
        });
    }

    async initBlackJackInstance(message: Message, currency: Currency, amount: number) {
        // TODO: Messages that are registered in _blackJackInstance + reactions on them.
        const startingCard = this.getCard();
        const startingDeck = [startingCard];
        const dealerDeck = this.getDealerDeck();

        const messageCreated = await this.client.messageUtil.replyWithEmbed(
            message,
            this.createBlackjackEmbed(message.createdById, startingDeck, dealerDeck, this.getDeckValue(startingDeck), 0, BlackjackCondition.Playing)
        );

        // Add reactions for easier interactions
        await Promise.all([
            messageCreated.addReaction(blackjackReactionHit),
            messageCreated.addReaction(blackjackReactionStand),
            startingCard === SpecialBlackjackVariant.Ace ? messageCreated.addReaction(blackjackReactionStandAce1) : null,
        ]);

        // Add to the registry to handle it with reactions
        this.blackJackInstances.push({
            serverId: message.serverId!,
            channelId: message.channelId,
            messageId: messageCreated.id,
            createdAt: Date.now(),
            createdBy: message.createdById,
            amount,
            currencyId: currency.id,
            deck: startingDeck,
            dealerDeck,
            currencyStartingBalance: currency.startingBalance,
        });
    }

    getCard(): number | SpecialBlackjackVariant {
        // Num cards 2-10 + face cards (3) + aces + 1 (since it doesn't reach 12 ever)
        const num = Math.floor(Math.random() * 13);

        return num < 9 ? 2 + num : randomBlackjackNumToCard[num];
    }

    getDeckValue(deck: Array<SpecialBlackjackVariant | number>) {
        return deck.map(this.getCardValue).reduce((a, b) => a + b);
    }

    getDealerDeckValue(dealerDeck: BlackjackDeck) {
        const dealerAceCount = dealerDeck.filter((card) => card === SpecialBlackjackVariant.Ace).length;
        // Have to remember which value aces are (1 or 11)
        const dealerDeckValueAce1 = this.getDeckValue(dealerDeck);
        const dealerDeckValueAce11 = this.getDeckValue(dealerDeck) + dealerAceCount * 10;

        return dealerDeckValueAce11 > 21 ? dealerDeckValueAce1 : dealerDeckValueAce11;
    }

    getCardValue(card: SpecialBlackjackVariant | number) {
        return typeof card === "number" ? card : card === SpecialBlackjackVariant.Ace ? 1 : 10;
    }

    getDealerDeck() {
        const dealerDeck: Array<SpecialBlackjackVariant | number> = [];
        let deckValue = 0;
        // Or just have deckValueAce11
        let aceCount = 0;

        // Deal until it hits at least deck value of 17 or more;
        // if it has aces and with aces being 11 goes over 21, then treat aces as 1
        while (asAce11(deckValue, aceCount) < 17 || (asAce11(deckValue, aceCount) > 21 && deckValue < 17)) {
            const newCard = this.getCard();
            const cardValue = this.getCardValue(newCard);

            dealerDeck.push(newCard);
            deckValue += cardValue;

            if (newCard === SpecialBlackjackVariant.Ace) aceCount++;
        }

        return dealerDeck;
    }

    createBlackjackEmbed(
        memberId: string,
        deck: BlackjackDeck,
        dealerDeck: BlackjackDeck,
        deckValue: number,
        dealerDeckValue: number,
        condition: BlackjackCondition
    ): EmbedPayload {
        const aceCount = deck.filter((x) => x === SpecialBlackjackVariant.Ace).length;
        const acesCanBe11 = (aceCount as unknown as boolean) && deckValue + aceCount * 10 < 22;

        return {
            title: ":diamonds: Blackjack",
            description: stripIndents`
                <@${memberId}> is playing blackjack.
            `,
            color:
                condition === BlackjackCondition.Playing
                    ? Colors.blockBackground
                    : condition === BlackjackCondition.Won
                    ? Colors.green
                    : condition === BlackjackCondition.Lost
                    ? Colors.red
                    : Colors.yellow,
            fields: [
                {
                    name: "Your Deck",
                    value: `[ ${stringifyBlackjackDeck(deck)} ] = ${deckValue}${acesCanBe11 ? ` or ${deckValue + aceCount * 10}` : ""}`,
                    inline: true,
                },
                {
                    name: "Dealer's Deck",
                    value:
                        condition === BlackjackCondition.Playing ? `[ ${stringifyCard(dealerDeck[0])}, Card ]` : `[ ${stringifyBlackjackDeck(dealerDeck)} ] = ${dealerDeckValue}`,
                    inline: true,
                },
                getStatusField(acesCanBe11, condition),
            ],
        };
    }
}

const asAce11 = (value: number, aceCount: number) => value + 10 * aceCount;

const getStatusField = (allowAce1: boolean, condition: BlackjackCondition): EmbedField =>
    condition === BlackjackCondition.Playing
        ? {
              name: "Actions",
              value: stripIndents`
            :point_down: \u2014 Hit
            :white_check_mark: \u2014 Stand${allowAce1 ? " (Aces as 11)\n\u2022 :ballot_box_with_check: \u2014 Stand (Aces as 1)" : ""}
            (Double down and split not available)
        `,
              inline: true,
          }
        : {
              name: "Game concluded",
              value: condition === BlackjackCondition.Won ? "You won." : condition === BlackjackCondition.Lost ? "You lost." : "It's a draw/neutral push.",
              inline: true,
          };
