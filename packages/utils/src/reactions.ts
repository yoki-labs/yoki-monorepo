import reactionsJson from "./reactions.json";

export interface ReactionInfo {
    id: number;
    name: string;
    symbol?: string;
}

export const getReactionByName = (name: string): ReactionInfo | undefined => reactionsJson.find((x) => x.name === name);
export const getReactionById = (id: number): ReactionInfo | undefined => reactionsJson.find((x) => x.id === id);
export const getReactionBySymbol = (symbol: string): ReactionInfo | undefined => reactionsJson.find((x) => x.symbol === symbol);

export const reactions = reactionsJson;
