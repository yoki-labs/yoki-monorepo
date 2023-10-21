import { PremiumType } from "@prisma/client";

export const premiumTierValues: Record<PremiumType, number> = {
    [PremiumType.Gold]: 3,
    [PremiumType.Silver]: 2,
    [PremiumType.Copper]: 1,
};
