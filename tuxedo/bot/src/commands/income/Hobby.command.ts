import { DefaultIncomeType } from "@prisma/client";

import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./normal-incomes";

const Hobby: Command = {
    name: "hobby",
    description: "Do activity you like and receive small donations.",
    aliases: ["hob", "h"],
    category: Category.Income,
    execute: generateIncomeCommand(DefaultIncomeType.HOBBY),
};

export default Hobby;
