import type { CommandArgument } from "../commands/Command";

export default (_input: string, args: string[], index: number, _, __, arg: CommandArgument) => {
    // get all the rest of the arguments starting from this arg to the end
    const restArgs = args.slice(index);
    // if there are no args and the argument isn't optional, then notify the user that their input is invalid
    if (restArgs.length === 0) return null;

    const values: string[] | undefined =
        arg.values &&
        restArgs
            .join(" ")
            .split(" | ")
            .map((x) => arg.values[x.toLowerCase()]);

    return values?.every((x) => typeof x != "undefined") ? values : null;
};
