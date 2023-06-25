import { Currency, DefaultIncomeType, IncomeCommand, Reward } from "@prisma/client";
import { TuxoClient } from "../../Client";
import Daily from "../income/Daily.command";
import { Command } from "../commands";
import Hobby from "../income/Hobby.command";
import Work from "../income/Work.command";
import { inlineCode } from "@yokilabs/bot";
import { defaultCreatedReceivedCurrency, defaultReceivedCurrency } from "../income/income-util";

export const DefaultIncomeTypeMap: Record<string, string> =
    Object.assign(
        {},
        ...Object
            .keys(DefaultIncomeType)
            .map((x) => ({
                [x.toLowerCase()]: DefaultIncomeType[x],
            })),
        incomeTypeMapFromCommand(Daily, DefaultIncomeType.DAILY),
        incomeTypeMapFromCommand(Hobby, DefaultIncomeType.HOBBY),
        incomeTypeMapFromCommand(Work, DefaultIncomeType.WORK),
    );

function incomeTypeMapFromCommand(command: Command, type: DefaultIncomeType) {
    const mapped: Record<string, string> = {};

    if (!command.aliases)
        return mapped;

    for (const alias of command.aliases)
        mapped[alias] = type;

    return mapped
}

export const nameRegex = /^[A-Za-z-_]+$/;

export const getUnavailableIncomeNames = (client: TuxoClient) =>
    client
        .commands
        .map((command) =>
            [command.name, ...(command.aliases ?? [])]
        )
        .flatMap((x) => x);


export const displayOverridenRewards = (incomeOverride: (IncomeCommand & { rewards: Reward[] }), serverCurrencies: Currency[]) =>
    incomeOverride.rewards.map(x =>
        `\u2022 ${inlineCode(x.minAmount)} to ${inlineCode(x.minAmount + x.minAmount)} ${serverCurrencies.find(y =>
            x.currencyId === y.id
        )?.name}`
    ).join("\n");

export function displayDefaultRewards(incomeType: DefaultIncomeType | string, serverCurrencies: Currency[]) {
    if (!serverCurrencies?.length)
        return `\u2022 (There is no currency to give)`;

    const receivedCurrency = defaultReceivedCurrency[incomeType] ?? defaultCreatedReceivedCurrency;

    return `\u2022 ${inlineCode(receivedCurrency[0])} to ${inlineCode(receivedCurrency[1] + receivedCurrency[0])} ${serverCurrencies[0].name} (default)`;
}
