import { Category, Command } from "../commands";
import { generateBankCommand } from "./bank-commands";

const Daily: Command = {
    name: "deposit",
    description: "Deposits money to the bank.",
    aliases: ["dep", "dp"],
    category: Category.Income,
    args: [
        {
            name: "tag",
            display: "currency tag | all",
            type: "string",
        },
        {
            name: "amount",
            type: "number",
            optional: true,
        },
    ],
    execute: generateBankCommand("pocket", "deposit", "deposited", 1, (balance) => balance.pocket),
};

export default Daily;
