import type { CommandArgValidator } from "../commands/command-typings";

const MAX_LIMIT = 2147483647;
const MIN_LIMIT = -MAX_LIMIT - 1;

export default [
    (input, _args, _index, _message, arg) => {
        const castedNumber = arg.allowDecimal ? parseFloat(input) : parseInt(input, 10);
        // if the argument is not properly castable to a number, then notify the user that their input is invalid
        if (Number.isNaN(castedNumber)) return null;
        else if (!arg.noLimit && (castedNumber > MAX_LIMIT || castedNumber < MIN_LIMIT)) return null;

        // if the argument is not undefined (and is a proper number), set the arg otherwise set to null cause it would be optional by then
        return castedNumber;
    },
    (arg) => `I was expecting a whole number, but did not receive that. Make sure you do not include any decimals or letters${arg.noLimit ? "" : ` or the number isn't above int32 limit`}.`,
] satisfies CommandArgValidator;
