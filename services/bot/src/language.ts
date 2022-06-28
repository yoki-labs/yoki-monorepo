import { Language } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";

import type { LanguageDictionary } from "./typings";

// Record of all supported languages
export const languages: Record<string, LanguageDictionary> = (() => {
    const current = {};

    // For each EN_US, EN_CA, EN_GB, bla bla
    for (const name of Object.keys(Language)) {
        const filePath = path.join(__dirname, "lang", `${name}.json`);

        const json: { name: string; terms: Record<string, string> } = JSON.parse(readFileSync(filePath, "utf-8"));

        current[name] = { ...json, getTerm: getTerm.bind(null, json) };
    }

    return current;
})();

export function getTerm(language: { name: string; terms: Record<string, string> }, name: string, ...args: any[]) {
    // Get the term, get number inside {0}, {1} (we name it N) and replace them with argument at index N
    return language.terms[name].replace(/[{]([0-9])[}]/g, (_, num) => args[num]);
}
