import { isHashId, isUUID } from "../util";
import type { CommandArgumentDefinition, CommandArgumentType } from "./Command";

const boolTrueValues = ["true", "yes", "enable"];
const boolValues = boolTrueValues.concat("false", "no", "disable");

const restPreTransform = (args: string[], i: number) => args.slice(i);

export const argumentDictionary: { [argType in CommandArgumentType]: CommandArgumentDefinition } = {
    string: {
        friendlyName: "string",
        isCorrect: (args, i) => typeof args[i] === "string",
    },
    number: {
        friendlyName: "number",
        isCorrect: (args, i) => !Number.isNaN(Number(args[i])),
        transform: Number,
    },
    boolean: {
        friendlyName: "'enable' or 'disable'",
        isCorrect: (args, i) => boolValues.includes(args[i]?.toLowerCase()),
        transform: (args, i) => boolTrueValues.includes(args[i]),
    },
    hashId: {
        friendlyName: "short ID",
        isCorrect: (args, i) => isHashId(args[i]),
    },
    UUID: {
        friendlyName: "long ID",
        isCorrect: (args, i) => isUUID(args[i]),
    },
    rest: {
        friendlyName: "multiple arguments",
        preTransform: restPreTransform,
        isCorrect: (_args, _i, value: string[]) => value.length > 0,
        transform: (_args, _i, value: string[]) => value.join(" "),
    },
    listRest: {
        friendlyName: "multiple separated arguments",
        preTransform: restPreTransform,
        isCorrect: (_args, _i, value: string[]) => value.length > 0,
        transform: (_args, _i, value: string[], commandArg) => (commandArg.separator ? value.join(" ").split(commandArg.separator) : value),
    },
};
