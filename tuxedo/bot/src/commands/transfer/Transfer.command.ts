import { Collection } from "@discordjs/collection";

import { Category, Command } from "../commands";
import TransferCurrency from "./Currency.command";
import TransferItem from "./Item.command";

const Currency: Command = {
    name: "transfer",
    description: "Allows you to transfer items and currenecies.",
    examples: [],
    parentCommand: true,
    category: Category.Balance,
    subCommands: new Collection<string, Command>().set("currency", TransferCurrency).set("item", TransferItem),
    execute: () => void 0,
};

export default Currency;
