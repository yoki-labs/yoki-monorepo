import { getReactionById, getReactionBySymbol, ReactionInfo } from "@yokilabs/utils";

import type { CommandArgValidator } from "../commands/command-typings";

export default [
    (input): ReactionInfo | null => {
        // if (input.startsWith(":") && input.endsWith(":")) {
        //     const name = input.substring(1, input.length - 1);

        //     return getReactionByName(name) ?? null;
        // }
        if (input.startsWith("<:") && input.endsWith(">")) {
            const split = input.substring(2, input.length - 1).split(":");

            if (split.length !== 2)
                return null;

            const [name, idStr] = split;
            const id = parseInt(idStr, 10);

            if (idStr.length === 0 || Number.isNaN(id))
                return null;

            return { id, name };
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
