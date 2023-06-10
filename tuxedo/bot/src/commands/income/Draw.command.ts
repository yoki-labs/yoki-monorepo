import { Category, Command } from "../commands";
import { generateBankCommand } from "./income-util";

const Daily: Command = {
    name: "withdraw",
    description: "Takes money from the bank.",
    aliases: ["draw", "take", "wd"],
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
    execute: generateBankCommand("bank", "withdraw", "withdrew", -1, (balance) => balance.bank),
};

export default Daily;
