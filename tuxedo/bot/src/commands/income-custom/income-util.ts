import { Currency, DefaultIncomeType, Reward } from "@prisma/client";
import { inlineCode } from "@yokilabs/bot";

import { TuxoClient } from "../../Client";
import { Command } from "../commands";
import Daily from "../income/Daily.command";
import Hobby from "../income/Hobby.command";
import { defaultCreatedReceivedCurrency, defaultIncomes } from "../income/income-defaults";
import Work from "../income/Work.command";

export const defaultOrCustomIncomeDisplay = `${Object.keys(DefaultIncomeType)
    .slice(0, 3)
    .concat("...")
    .map((x) => x.toLowerCase())
    .join(" / ")} / (custom income command)`;

export const DefaultIncomeTypeMap: Record<string, string> = Object.assign(
    {},
    ...Object.keys(DefaultIncomeType).map((x) => ({
        [x.toLowerCase()]: DefaultIncomeType[x],
    })),
    incomeTypeMapFromCommand(Daily, DefaultIncomeType.DAILY),
    incomeTypeMapFromCommand(Hobby, DefaultIncomeType.HOBBY),
    incomeTypeMapFromCommand(Work, DefaultIncomeType.WORK)
);

function incomeTypeMapFromCommand(command: Command, type: DefaultIncomeType) {
    const mapped: Record<string, string> = {};

    if (!command.aliases) return mapped;

    for (const alias of command.aliases) mapped[alias] = type;

    return mapped;
}

export const nameRegex = /^[A-Za-z-_]+$/;

export const getUnavailableIncomeNames = (client: TuxoClient) => client.commands.map((command) => [command.name, ...(command.aliases ?? [])]).flatMap((x) => x);

export const displayOverridenRewards = (rewards: Reward[], serverCurrencies: Currency[]) =>
    rewards
        .map((x) => {
            const currency = serverCurrencies.find((y) => x.currencyId === y.id);

            return `:${currency?.emote}: ${inlineCode(x.minAmount)} to ${inlineCode(x.maxAmount)} ${currency?.name}`;
        })
        .join("\n");

export function displayDefaultRewards(incomeType: DefaultIncomeType | string, serverCurrencies: Currency[]) {
    if (!serverCurrencies?.length) return `(There is no currency to give)`;

    const receivedCurrency = defaultIncomes[incomeType]?.rewards ?? defaultCreatedReceivedCurrency;
    const firstCurrency = serverCurrencies[0];

    return `:${firstCurrency.emote}: ${inlineCode(receivedCurrency[0])} to ${inlineCode(receivedCurrency[1] + receivedCurrency[0])} ${firstCurrency.name} (default)`;
}
