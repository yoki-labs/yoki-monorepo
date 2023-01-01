import type { CommandArgument, CommandArgValidator } from "../commands/Command";
import { listInlineCode } from "../utils/formatters";

export default [
	(input: string, _, __, ___, ____, arg: CommandArgument) => {
		if (!arg.values) return null;
		const resolvedFromObj = arg.values[input.toUpperCase()] ?? arg.values[input];
		if (!resolvedFromObj) return null;
		return { original: input, resolved: resolvedFromObj }
	},
	(arg) => `I was expecting a single phrase from the following options: ${listInlineCode(Object.keys(arg.values))}.`
]satisfies CommandArgValidator;
