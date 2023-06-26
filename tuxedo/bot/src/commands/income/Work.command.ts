import { DefaultIncomeType } from "@prisma/client";
import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./income-util";

const Work: Command = {
    name: "work",
    description: "Allows you to work with 8 hour cooldown.",
    aliases: ["job", "w"],
    category: Category.Income,
    execute: generateIncomeCommand(DefaultIncomeType.WORK),
};

export default Work;
