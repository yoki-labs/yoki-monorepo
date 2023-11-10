import { DefaultIncomeType } from "@prisma/client";

export const defaultIncomes: Record<DefaultIncomeType, { reward: [number, number]; cooldown: number; action: string[]; failChance: number; failCut: number }> = {
    [DefaultIncomeType.DAILY]: {
        // 1000-10000
        reward: [1000, 9000],
        cooldown: 24 * 60 * 60 * 1000,
        action: ["You have claimed a daily reward, which had {}.", "You have received a mail from stranger that had {}."],
        failChance: 0,
        failCut: 0,
    },
    [DefaultIncomeType.WORK]: {
        // 1000-6000
        reward: [1000, 5000],
        cooldown: 8 * 60 * 60 * 1000,
        action: ["After long working hours, you claimed {}.", "You have worked overtime and received {}.", "You did some work as a freelancer and got {}."],
        failChance: 0,
        failCut: 0,
    },
    [DefaultIncomeType.HOBBY]: {
        // 500-3000
        reward: [500, 2500],
        cooldown: 40 * 60 * 1000,
        action: [
            "You have received some hobby donations, which were {}.",
            "You have sold your creations you've done and received {}.",
            "You have commissioned some art and received {}.",
            "After long hours of stream, you have collected {} from donations.",
        ],
        failChance: 0,
        failCut: 0,
    },
    [DefaultIncomeType.CHORE]: {
        // 100-1000
        reward: [100, 900],
        cooldown: 10 * 60 * 1000,
        action: ["You did some house chores and stumbled upon {}.", "You mowed neighbour's lawn and were given {}."],
        failChance: 0,
        failCut: 0,
    },
    [DefaultIncomeType.COMMUNITY]: {
        // 250-3000
        reward: [250, 2750],
        cooldown: 20 * 60 * 1000,
        action: ["You raked some leaves off the street and received {}."],
        failChance: 0,
        failCut: 0,
    },
    [DefaultIncomeType.ROB]: {
        // 1000-3000
        reward: [1000, 2000],
        cooldown: 2 * 60 * 60 * 1000,
        action: ["Robbed"],
        failChance: 0.5,
        failCut: 1,
    },
    [DefaultIncomeType.BLACKJACK]: {
        // 1'000-1'000'000, it doesn't add 1'000 to the max
        reward: [1000, 1000000],
        cooldown: 60 * 1000,
        action: ["Played blackjack"],
        failChance: 0,
        failCut: 0,
    },
};
export const defaultCreatedCooldown = 4 * 60 * 60 * 1000;
export const defaultCreatedReceivedCurrency = [1000, 2000];

export const bankCooldown = 2 * 60 * 60 * 1000;
