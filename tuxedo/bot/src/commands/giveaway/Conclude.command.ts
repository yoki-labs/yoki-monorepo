import { Category, Command } from "../commands";

const Conclude: Command = {
    name: "giveaway-conclude",
    description: "Concludes an on-going giveaway and shows the winners early",
    usage: "",
    subName: "conclude",
    subCommand: true,
    category: Category.Events,
    // requiredRole: RoleType.MOD,
    args: [
        {
            name: "id",
            type: "string"
        }
    ],
    execute: async (message, _args, ctx) => {
        return ctx.messageUtil.replyWithSuccess(message, "Giveaway has been concluded", ".");
    },
};

export default Conclude;
