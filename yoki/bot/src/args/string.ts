import type { CommandArgValidator } from "../commands/Command";

export default [(input: string) => {
	if (typeof input !== "string") return null;
	return input;
}, (_arg) => "I was expecting a word or phrase, but did not receive that."]satisfies CommandArgValidator;
