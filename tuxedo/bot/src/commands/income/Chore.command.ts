import { DefaultIncomeType } from "@prisma/client";

import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./normal-incomes";

const Chore: Command = {
    name: "chore",
    description: "Allows you to do chores with 20 minute cooldown.",
    aliases: ["chores", "ch"],
    category: Category.Income,
    execute: generateIncomeCommand(DefaultIncomeType.CHORE),
};

export default Chore;
