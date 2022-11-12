const yesType = ["true", "enable", "yes"];
const noType = ["disable", "false", "no"];

export default (input: string) => {
    // if not a proper "yes/no" type input, notify the user
    if (![...yesType, ...noType].includes(input.toLowerCase())) return null;
    // if the input is a truthy value, the argument will be set to true, otherwise false.
    return yesType.includes(input.toLowerCase());
};
