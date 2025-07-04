import { Category, Command } from "../commands";
import { generateBankCommand } from "./bank-commands";

const Withdraw: Command = {
    name: "withdraw",
    description: "Takes money from the bank.",
    aliases: ["draw", "take", "wd"],
    category: Category.Balance,
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
    execute: generateBankCommand("bank", "withdraw", "withdrew", -1, (balance, startingBalance) => balance?.bank ?? startingBalance ?? 0),
};

export default Withdraw;
