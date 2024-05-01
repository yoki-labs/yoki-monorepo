import { Currency } from "@prisma/client";
import { createEmoteNode, createTextElement } from "@yokilabs/bot";
import { RichMarkupEmote, RichMarkupText } from "@yokilabs/bot/dist/src/utils/rich-types";

export const displayCurrencyAmount = (currency: Currency, amount: number | bigint) => `:${currency.emote}: ${amount} ${currency.name}`;
export const displayCurrencyAmountInline = (currency: Currency, amount: number | bigint) => `<::${currency.emoteId}> ${amount} ${currency.name}`;

export const displayCurrencyAmountRichMarkup = (currency: Currency, amount: number | bigint, addComma = false, ending = ""): (RichMarkupText | RichMarkupEmote)[] => [
    createEmoteNode(currency.emoteId, currency.emote),
    createTextElement(` ${amount} ${currency.name}${addComma ? ", " : ending}`),
];

export const displayCurrency = (currency: Currency) => `:${currency.emote}: ${currency.name}`;
