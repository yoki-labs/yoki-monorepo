import { ContentFilter, FilterMatching, ResponseType, RoleType } from "@prisma/client";

export const roleValues: { [staffRole in RoleType]: number } = {
    [RoleType.ADMIN]: 3,
    [RoleType.MOD]: 2,
    [RoleType.MINIMOD]: 1,
    [RoleType.REACT]: 0,
};

const DateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
} as const;

export function FormatDate(date: Date, timeZone: string) {
    return date.toLocaleDateString("en-US", { ...DateOptions, timeZone });
}

export function suspicious(date: Date) {
    return date.getTime() > new Date().getTime() - 8.64e7;
}

export function getFilterFromSyntax(word: string): [string, FilterMatching] {
    const isPrefixed = word.endsWith("*");
    const isSuffixed = word.startsWith("*");

    return isPrefixed && isSuffixed
        ? [word.substring(1, word.length - 1), FilterMatching.INFIX]
        : isPrefixed
        ? [word.substring(0, word.length - 1), FilterMatching.PREFIX]
        : isSuffixed
        ? [word.substring(1), FilterMatching.POSTFIX]
        : [word, FilterMatching.WORD];
}

export function filterToString(filter: ContentFilter) {
    return filter.matching === FilterMatching.INFIX
        ? `*${filter.content}*`
        : // *word, word* or word
          `${filter.matching === FilterMatching.POSTFIX ? "*" : ""}${filter.content}${filter.matching === FilterMatching.PREFIX ? "*" : ""}`;
}

export const antiRaidResponseMap = {
    captcha: ResponseType.TEXT_CAPTCHA,
    kick: ResponseType.KICK,
    site: ResponseType.SITE_CAPTCHA,
} as const;
export const antiRaidResponseTransformer = (str: string) => antiRaidResponseMap[str];
export const typeToDBPropMap = {
    modmail: "modmailEnabled",
    automod: "filterEnabled",
    antiraid: "antiRaidEnabled",
    antihoist: "antiHoistEnabled",
    nsfwscan: "scanNSFW",
    invitescan: "filterInvites",
    appeals: "appealsEnabled",
};

export const DBPropToTypeMap = Object.assign({}, ...Object.keys(typeToDBPropMap).map((x) => ({ [typeToDBPropMap[x]]: x })));
export const typeToDBPropKeys = Object.keys(typeToDBPropMap);
export const DBPropToTypeKeys = Object.values(typeToDBPropMap);

export const removeSettingKeys = ["remove", "null"];
export const isInputRemoveSetting = (str: string) => removeSettingKeys.some((x) => str === x);
export const removeGroupMessage = (prefix: string) => `*You can unset the modmail group by doing:* \`${prefix}modmail group remove\``;
export const removeCategoryMessage = (prefix: string) => `*You can unset the modmail category by doing:* \`${prefix}modmail category remove\``;
export const removePingRole = (prefix: string) => `*You can unset the ping role by doing:* \`${prefix}modmail pingrole remove\``;
export const addOrRemoveStaffRoleMessage = (prefix: string) => `*Add mod role:* \`${prefix}role staff <role-id> <mod/admin/remove>\``;
export const addOrRemoveMuteRoleMessage = (prefix: string) => `Set mute role: \`${prefix}role mute <role-id>\`.\nYou can remove by putting "remove" instead of role-id`;
export const addOrRemoveMemberRoleMessage = (prefix: string) => `Set member role: \`${prefix}role member <role-id>\`.\nYou can remove by putting "remove" instead of role-id`;
