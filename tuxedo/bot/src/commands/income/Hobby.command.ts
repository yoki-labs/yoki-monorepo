import { Category, Command } from "../commands";
import { generateIncomeCommand } from "./income-util";

const hobbyCooldown = 2 * 60 * 60 * 1000;

const Hobby: Command = {
    name: "hobby",
    description: "Do activity you like and receive small donations.",
    aliases: ["hob", "h"],
    category: Category.Income,
    execute: generateIncomeCommand("hobby", "to do your hobbies", hobbyCooldown, 40, 10, "Hobby donations received", "You have received some donations"),
};

export default Hobby;
