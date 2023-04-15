import { listInlineCode } from "@yokilabs/util";

import type { CommandArgValidator } from "../commands/command-typings";

export default [
    (_input, args, index, _message, arg) => {
        // get all the rest of the arguments starting from this arg to the end
        const restArgs = args.slice(index);
        // if there are no args and the argument isn't optional, then notify the user that their input is invalid
        if (restArgs.length === 0) return null;

        const values: string[] | undefined = arg.values && restArgs.map((x) => arg.values[x.toLowerCase()]);

        return values?.every((x) => typeof x !== "undefined") ? values : null;
    },
    (arg) => `I was expecting one or more phrases from the following options: ${listInlineCode(Object.keys(arg.values))}.`,
] satisfies CommandArgValidator;
