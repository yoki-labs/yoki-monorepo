import type { CommandArgument, CommandArgValidator } from "../commands/Command";
import { listInlineCode } from "../utils/formatters";

export default [(_input: string, args: string[], index: number, _, __, arg: CommandArgument) => {
	// get all the rest of the arguments starting from this arg to the end
	const restArgs = args.slice(index);
	// if there are no args and the argument isn't optional, then notify the user that their input is invalid
	if (restArgs.length === 0) return null;

	const values: string[] | undefined = arg.values && restArgs.map((x) => arg.values[x.toLowerCase()]);

	return values?.every((x) => typeof x != "undefined") ? values : null;
}, (arg) => `I was expecting one or more phrases from the following options: ${listInlineCode(Object.keys(arg.values))}.`]satisfies CommandArgValidator;
