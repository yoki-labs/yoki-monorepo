import { DefaultIncomeType } from "@prisma/client";
import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./income-util";

const Daily: Command = {
    name: "daily",
    description: "Gets daily reward.",
    aliases: ["day", "d"],
    category: Category.Income,
    execute: generateIncomeCommand(DefaultIncomeType.DAILY),
};

export default Daily;
