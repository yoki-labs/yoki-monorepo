import { RoleType } from "@prisma/client";

export const RoleTypeValues: Record<RoleType, number> = {
    [RoleType.MINIMOD]: 1,
    [RoleType.MOD]: 2,
    [RoleType.ADMIN]: 3,
};
