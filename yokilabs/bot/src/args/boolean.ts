import { listInlineCode } from "../utils/formatting";

import type { CommandArgValidator } from "../commands/command-typings";

const yesType = ["true", "enable", "yes"];
const noType = ["disable", "false", "no"];

export default [
    (input) => {
        // if not a proper "yes/no" type input, notify the user
        if (![...yesType, ...noType].includes(input.toLowerCase())) return null;
        // if the input is a truthy value, the argument will be set to true, otherwise false.
        return yesType.includes(input.toLowerCase());
    },
    (_arg) => `
		I was expecting a valid yes/no statement. 
		
		If you want to indicate yes, use: ${listInlineCode(yesType)}
		If you want to indicate no, use: ${listInlineCode(noType)}
	`,
] satisfies CommandArgValidator;
