import { ContentFilter, FilterMatching } from "@prisma/client";

import { RoleType } from ".prisma/client";

export const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);
export const isHashId = (str: string) => /^[0-9A-Za-z]{8,}$/.test(str);
export const roleValues: { [staffRole in RoleType]: number } = {
    [RoleType.ADMIN]: 2,
    [RoleType.MOD]: 1,
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
export const LINK_REGEX = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;

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
