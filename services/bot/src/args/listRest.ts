export default (_input: string, args: string[], index: number) => {
    // get all the rest of the arguments starting from this arg to the end
    const restArgs = args.slice(index);
    // if there are no args and the argument isn't optional, then notify the user that their input is invalid
    if (restArgs.length === 0) return null;
    return restArgs.join(" ").split(" | ");
};
