import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./income-util";

const dailyCooldown = 24 * 60 * 60 * 1000;

const Daily: Command = {
    name: "daily",
    description: "Gets daily reward.",
    aliases: ["day", "d"],
    category: Category.Income,
    execute: generateIncomeCommand("daily", "to get daily reward", dailyCooldown, 250, 50, "Daily reward claimed", "You have received a present"),
};

export default Daily;
