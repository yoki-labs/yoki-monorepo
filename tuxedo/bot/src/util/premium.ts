import { PremiumType, Server } from "@prisma/client";

type ServerLimitDictionaryFallback = "Early" | "Default";

type ServerLimitDictionary = Record<PremiumType | ServerLimitDictionaryFallback, number>;

/**
 * Creates a new function that determines a limit of the server based on its early access level and premium level.
 * @param dictionary The dictionary of possible values for premium, early access (just "early") or non-premium and non-early access ("default")
 * @returns Function to get a limit of a server
 */
export const createServerLimit = (dictionary: ServerLimitDictionary) =>
    (server: Server) =>
        dictionary[server.premium ?? (server.flags.includes("EARLY_ACCESS") ? "Early" : "Default")];