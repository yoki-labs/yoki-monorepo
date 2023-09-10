import { Currency } from "@prisma/client";

export const displayCurrencyAmount = (currency: Currency, amount: number) => `:${currency.emote}: ${amount} ${currency.name}`;

export const displayCurrency = (currency: Currency) => `:${currency.emote}: ${currency.name}`;
