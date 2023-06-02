import { Category, Command } from "../commands";

const Daily: Command = {
    name: "daily",
    description: "Gets daily reward.",
    // usage: "[id-of-user]",
    examples: ["0mqNyllA"],
    aliases: ["day", "d"],
    category: Category.Income,
    execute: async (message, _args, ctx) => {
        return ctx.messageUtil.replyWithInfo(message, "WIP", "WIP");
    },
};

export default Daily;
