import type { CommandArgument, CommandArgValidator } from "../commands/Command";
import { listInlineCode } from "../utils/formatters";

export default [
	(input: string, _, __, ___, ____, arg: CommandArgument): string | number => (arg.values && arg.values[input.toUpperCase()]) ?? null,
	(arg) => `I was expecting a single phrase from the following options: ${listInlineCode(arg.values)}.`
]satisfies CommandArgValidator;
