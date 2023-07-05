import { DefaultIncomeType } from "@prisma/client";

export const defaultIncomes: Record<DefaultIncomeType, { reward: number[]; cooldown: number; action: string }> = {
    [DefaultIncomeType.DAILY]: {
        // 500-3000
        reward: [500, 3000],
        cooldown: 24 * 60 * 60 * 1000,
        action: "Claimed a daily reward",
    },
    [DefaultIncomeType.WORK]: {
        // 500-1500
        reward: [500, 1000],
        cooldown: 8 * 60 * 60 * 1000,
        action: "Claimed your wage",
    },
    [DefaultIncomeType.HOBBY]: {
        // 100-400
        reward: [100, 300],
        cooldown: 2 * 60 * 60 * 1000,
        action: "Received some hobby donations",
    },
    [DefaultIncomeType.ROB]: {
        reward: [500, 2500],
        cooldown: 16 * 60 * 60 * 1000,
        action: "Robbed",
    }
};
export const defaultCreatedCooldown = 6 * 60 * 60 * 1000;
export const defaultCreatedReceivedCurrency = [25, 175];

export const bankCooldown = 12 * 60 * 60 * 1000;