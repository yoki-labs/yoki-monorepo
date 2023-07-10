import { DefaultIncomeType } from "@prisma/client";

export const defaultIncomes: Record<DefaultIncomeType, { reward: [number, number]; cooldown: number; action: string }> = {
    [DefaultIncomeType.DAILY]: {
        // 1000-10000
        reward: [1000, 9000],
        cooldown: 24 * 60 * 60 * 1000,
        action: "Claimed a daily reward",
    },
    [DefaultIncomeType.WORK]: {
        // 1000-6000
        reward: [1000, 5000],
        cooldown: 8 * 60 * 60 * 1000,
        action: "Claimed your wage",
    },
    [DefaultIncomeType.HOBBY]: {
        // 500-3000
        reward: [500, 2500],
        cooldown: 40 * 60 * 1000,
        action: "Received some hobby donations",
    },
    [DefaultIncomeType.CHORE]: {
        // 100-1000
        reward: [100, 900],
        cooldown: 10 * 60 * 1000,
        action: "Done house chores",
    },
    [DefaultIncomeType.COMMUNITY]: {
        // 250-3000
        reward: [250, 2750],
        cooldown: 20 * 60 * 1000,
        action: "Done community/public chores",
    },
    [DefaultIncomeType.ROB]: {
        // 1000-3000
        reward: [1000, 2000],
        cooldown: 2 * 60 * 60 * 1000,
        action: "Robbed",
    },
    [DefaultIncomeType.BLACKJACK]: {
        // 10'000-1'000'000, it doesn't add 10'000 to the max
        reward: [10000, 1000000],
        cooldown: 60 * 1000,
        action: "Played blackjack",
    },
};
export const defaultCreatedCooldown = 6 * 60 * 60 * 1000;
export const defaultCreatedReceivedCurrency = [1000, 2000];

export const bankCooldown = 2 * 60 * 60 * 1000;
