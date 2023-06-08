import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./income-util";

const workCooldown = 8 * 60 * 60 * 1000;

const Work: Command = {
    name: "work",
    description: "Allows you to work with 8 hour cooldown.",
    aliases: ["job", "w"],
    category: Category.Income,
    execute: generateIncomeCommand("work", "to work", workCooldown, 75, 25, "Wage claimed", "After working long hours, you received your wage"),
};

export default Work;
