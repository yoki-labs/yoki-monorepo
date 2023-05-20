import { Category, Command } from "../commands";

const Stop: Command = {
    name: "giveaway-stop",
    description: "Stops an on-going giveaway without showing any winners",
    // usage: "",
    subName: "stop",
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
        return ctx.messageUtil.replyWithSuccess(message, "Giveaway has been stopped", "The giveaway has been successfully stopped.");
    },
};

export default Stop;
