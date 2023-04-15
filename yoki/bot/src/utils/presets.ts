import { readdirSync } from "fs";
import { join } from "path";

import type { PresetLink, PresetPattern, PresetPatternObject } from "../typings";

// 0 - should have space before/after it
// 1 - should have letters before/after it
const wordRest = ["", "[\\W]*"];

export const wordPresets = getPresets<PresetPattern[], RegExp>("content", (preset) => new RegExp(transformPresetUnit(preset), "s"));

export const urlPresets = getPresets<PresetLink[], PresetLink[]>("url", (preset) => preset);

function getPresets<P, T>(directory: string, transform: (preset: P, name: string) => T): Record<string, T> {
    const dirPath = join(__dirname, "..", "presets", directory);
    const files = readdirSync(dirPath, { withFileTypes: true });
    const loadedPresets: Record<string, T> = {};
    for (const file of files.filter((x) => x.name.endsWith(".json"))) {
        const preset = require(join(dirPath, file.name)) as P;
        const presetName = file.name.split(".")[0];

        loadedPresets[presetName] = transform(preset, presetName);

        console.log(`Loaded ${directory} preset ${file.name}`);
    }
    return loadedPresets;
}

function transformPresetUnit(patterns: PresetPattern[]) {
    return `(\\W+|^)(?:${transformPreset(patterns)})(\\W+|$)`;
}

// ["abc", "def"] => "abc|def"
function transformPreset(patterns: PresetPattern[]) {
    return patterns.map(transformPresetValue).join("|");
}

// "abc" => "abc"
// ["abc", "def"] => "abc[...]+def"
// { type: "PREFIX", _: [ "abc", "def" ] } => "(?:abc[\\W]+|def[\\W]+)"
function transformPresetValue(pattern: PresetPattern): string {
    return Array.isArray(pattern) ? (pattern as string[]).join("[\\s:\\-+~'.,?!]") : typeof pattern === "object" ? transformPresetObject(pattern as PresetPatternObject) : pattern;
}

function transformPresetObject(pattern: PresetPatternObject): string {
    if (pattern.type === "WORD") return `(?:${transformPreset(pattern._)})`;

    // Get boolean and convert it to number (0 or 1), which is now an index of wordRest
    const prefix = Number(["PREFIX", "INFIX"].includes(pattern.type));
    const postfix = Number(["POSTFIX", "INFIX"].includes(pattern.type));

    return `(?:${wordRest[postfix]}${transformPreset(pattern._)}${wordRest[prefix]})`;
}
