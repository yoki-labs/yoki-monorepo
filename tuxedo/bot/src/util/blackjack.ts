export enum SpecialBlackjackVariant {
    Jack = "Jack",
    Queen = "Queen",
    King = "King",
    Ace = "Ace",
}

export enum BlackjackCondition {
    Playing,
    Won,
    Lost,
    NeutralPush,
}

export const randomBlackjackNumToCard = {
    9: SpecialBlackjackVariant.Jack,
    10: SpecialBlackjackVariant.King,
    11: SpecialBlackjackVariant.Queen,
    12: SpecialBlackjackVariant.Ace,
};

export type BlackjackCard = number | SpecialBlackjackVariant;
export type BlackjackDeck = Array<BlackjackCard>;

export const stringifyCard = (card: BlackjackCard) => (typeof card === "number" ? `Num ${card}` : card);
export const stringifyBlackjackDeck = (deck: BlackjackDeck) => deck.map(stringifyCard).join(", ");
