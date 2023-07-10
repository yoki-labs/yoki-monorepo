import { DefaultIncomeType } from "@prisma/client";

import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./normal-incomes";

const Community: Command = {
    name: "community",
    description: "Allows you to do public/community chores with 30 minute cooldown.",
    aliases: ["chores", "ch"],
    category: Category.Income,
    execute: generateIncomeCommand(DefaultIncomeType.COMMUNITY),
};

export default Community;
