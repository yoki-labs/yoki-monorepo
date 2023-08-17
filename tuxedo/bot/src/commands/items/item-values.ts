import { Currency, ItemValue } from "@prisma/client";

export const displayItemValues = (itemValues: ItemValue[], serverCurrencies: Currency[]) =>
    itemValues
        .map((x) => {
            const currency = serverCurrencies.find((y) => x.currencyId === y.id)!;

            return `:${currency.emote}: ${x.amount} ${currency.name}`;
        })
        .join("\n");