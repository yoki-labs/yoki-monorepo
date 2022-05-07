import { RoleType } from ".prisma/client";

export const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);
export const isHashId = (str: string) => /^[0-9A-Za-z]{8,}$/.test(str);
export const roleValues: { [staffRole in RoleType]: number } = {
    [RoleType.ADMIN]: 2,
    [RoleType.MOD]: 1,
    [RoleType.REACT]: 0,
};
