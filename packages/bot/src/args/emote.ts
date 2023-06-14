import type { CommandArgValidator } from "../commands/command-typings";
import { getReactionById, getReactionByName, getReactionBySymbol, ReactionInfo } from "../static/static";

export default [
    (input): ReactionInfo | null => {
        console.log("Emote input", [input]);
        if (input.startsWith(":") && input.endsWith(":")) {
            const name = input.substring(1, input.length - 1);

            return getReactionByName(name) ?? null;
        }
        const id = Number(input);

        // Don't have floating/decimal numbers or numbers that are not emote IDs 
        // 90000000-9009999 might only work for default emotes
        if (id && id >= 90000000 && id <= 90009999 && !(id % 1)) return getReactionById(id) ?? null;
        // It would be rare for it to be more than 5 symbols
        else if (input.length < 6) return getReactionBySymbol(input) ?? null;

        return null;
    },
    (_arg) => `I was expecting an emoji or its ID.`,
] satisfies CommandArgValidator;
