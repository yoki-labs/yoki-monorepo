import type { CommandArgValidator } from "../commands/command-typings";

export default [
    // (input) => {
    //     if (typeof input !== "string") return null;
    //     return input;
    // },
    (input) => input,
    (_arg) => "I was expecting a word or phrase, but did not receive that.",
] satisfies CommandArgValidator;
