import { RoleType } from "@prisma/client";

export const roleTypeLevels: Record<RoleType, number> = {
    [RoleType.ADMIN]: 3,
    [RoleType.MOD]: 2,
    [RoleType.MINIMOD]: 1,
    [RoleType.REACT]: 0,
}