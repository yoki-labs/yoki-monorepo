import type { CommandArgValidator } from "../commands/command-typings";
import { listInlineCode } from "../utils/formatting";

export default [
    (input, _args, _index, _message, arg) => {
        if (!arg.values) return null;
        const resolvedFromObj = arg.values[input.toUpperCase()] ?? arg.values[input];
        if (!resolvedFromObj) return null;
        return { original: input, resolved: resolvedFromObj };
    },
    (arg) => `I was expecting a single phrase from the following options: ${listInlineCode(Object.keys(arg.values!))}.`,
] satisfies CommandArgValidator;
