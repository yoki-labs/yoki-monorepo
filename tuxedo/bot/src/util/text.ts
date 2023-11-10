import { Currency } from "@prisma/client";
import { createDefaultEmoteNode, createTextElement } from "@yokilabs/bot";
import { RichMarkupEmote, RichMarkupText } from "@yokilabs/bot/dist/src/utils/rich-types";
import { getReactionByName } from "@yokilabs/utils";

export const displayCurrencyAmount = (currency: Currency, amount: number) => `:${currency.emote}: ${amount} ${currency.name}`;

export const displayCurrencyAmountRichMarkup = (currency: Currency, amount: number, addComma = false): (RichMarkupText | RichMarkupEmote)[] => [
    createDefaultEmoteNode(getReactionByName(currency.emote)!.id, currency.emote),
    createTextElement(` ${amount} ${currency.name}${addComma ? ", " : ""}`),
];

export const displayCurrency = (currency: Currency) => `:${currency.emote}: ${currency.name}`;
