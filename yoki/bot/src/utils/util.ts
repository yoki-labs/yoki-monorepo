import { ContentFilter, FilterMatching, ResponseType, RoleType } from "@prisma/client";

export const isDomain = (str: string) => /[^!@#$%^&*()?<>.,~`'":;\\\/|\s()\[\]]+\.[^!@#$%^&*()?<>.,~`'":;\\\/|\s()\[\]]+/.test(str);
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

export function FormatDate(date: Date) {
    return date.toLocaleDateString("en-US", DateOptions);
}

export function suspicious(date: Date) {
    return date.getTime() > new Date().getTime() - 8.64e7;
}

export const IMAGE_REGEX = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;

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
    captcha: ResponseType.CAPTCHA,
    kick: ResponseType.KICK,
} as const;
export const antiRaidResponseTransformer = (str: string) => antiRaidResponseMap[str];
export const typeToDBPropMap = {
    modmail: "modmailEnabled",
    automod: "filterEnabled",
    antiraid: "antiRaidEnabled",
    antihoist: "antiHoistEnabled",
    nsfwscan: "scanNSFW",
    invitescan: "filterInvites",
};

export const DBPropToTypeMap = Object.assign({}, ...Object.keys(typeToDBPropMap).map((x) => ({ [typeToDBPropMap[x]]: x })));
export const typeToDBPropKeys = Object.keys(typeToDBPropMap);
export const DBPropToTypeKeys = Object.values(typeToDBPropMap);

export { cutArray, isHashId, isUUID } from "@yokilabs/util";
