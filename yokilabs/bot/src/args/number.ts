import type { CommandArgValidator } from "../commands/command-typings";

export default [(input) => {
	const castedNumber = Number(input);
	// if the argument is not properly castable to a number, then notify the user that their input is invalid
	if (Number.isNaN(castedNumber)) return null;
	// if the argument is not undefined (and is a proper number), set the arg otherwise set to null cause it would be optional by then
	return castedNumber;
}, (_arg) => "I was expecting a whole number, but did not receive that. Make sure you do not include any decimals or letters."]satisfies CommandArgValidator;
