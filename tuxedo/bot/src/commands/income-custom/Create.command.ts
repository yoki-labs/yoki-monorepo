import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";

const Create: Command = {
    name: "income-create",
    description: "Allows you to create a custom income command.",
    subName: "create",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx) => ctx.messageUtil.replyWithNullState(message, "This room is rather empty", `You discover a room full of crickets. It seems that you cannot do much here. Come back later.`),
};

export default Create;
