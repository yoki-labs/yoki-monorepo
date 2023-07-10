import { DefaultIncomeType } from "@prisma/client";

export const defaultIncomes: Record<DefaultIncomeType, { reward: [number, number]; cooldown: number; action: string }> = {
    [DefaultIncomeType.DAILY]: {
        // 500-5000
        reward: [500, 4500],
        cooldown: 24 * 60 * 60 * 1000,
        action: "Claimed a daily reward",
    },
    [DefaultIncomeType.WORK]: {
        // 500-2500
        reward: [500, 2000],
        cooldown: 8 * 60 * 60 * 1000,
        action: "Claimed your wage",
    },
    [DefaultIncomeType.HOBBY]: {
        // 100-400
        reward: [100, 300],
        cooldown: 1 * 60 * 60 * 1000,
        action: "Received some hobby donations",
    },
    [DefaultIncomeType.CHORE]: {
        reward: [50, 250],
        cooldown: 20 * 60 * 1000,
        action: "Done house chores",
    },
    [DefaultIncomeType.COMMUNITY]: {
        reward: [50, 750],
        cooldown: 30 * 60 * 1000,
        action: "Done community/public chores",
    },
    [DefaultIncomeType.ROB]: {
        reward: [500, 2500],
        cooldown: 10 * 60 * 60 * 1000,
        action: "Robbed",
    },
    [DefaultIncomeType.BLACKJACK]: {
        // 100-1'000'000, it doesn't add 100 to the max
        reward: [100, 1000000],
        cooldown: 60 * 1000,
        action: "Played blackjack",
    },
};
export const defaultCreatedCooldown = 6 * 60 * 60 * 1000;
export const defaultCreatedReceivedCurrency = [25, 175];

export const bankCooldown = 12 * 60 * 60 * 1000;
