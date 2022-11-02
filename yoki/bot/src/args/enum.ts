import type { CommandArgument } from "../commands/Command";

export default (input: string, _, __, ___, ____, arg: CommandArgument): string | number => (arg.values && arg.values[input.toUpperCase()]) ?? null;
