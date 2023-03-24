import type { CommandArgument } from "../commands/Command";

export default (input: string, _: any, __: any, ___: any, ____: any, arg: CommandArgument): string | number => (arg.values && arg.values[input.toUpperCase()]) ?? null;
