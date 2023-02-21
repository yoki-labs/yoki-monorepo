import type { CommandArgValidator } from "../commands/Command";

export default [(_input: string, rawArgs: string[], index: number) => {
	// get all the rest of the arguments starting from this arg to the end
	const restArgs = rawArgs.slice(index);
	// if there are no args, then notify the user that it's invalid
	if (restArgs.length === 0) return null;

	// concatenate all the args into one string
	return restArgs.join(" ");
}, (_arg) => "I was expecting a sentence or multiple phrases, but did not receive that."] satisfies CommandArgValidator;
