import type { CommandArgValidator } from "../commands/command-typings";
import ms from "ms";

export default [
    (input) => ms(input) ?? null,
    (_arg) => "I was expecting time duration (e.g., `15min`, `2d`, `2w`).",
] satisfies CommandArgValidator;
