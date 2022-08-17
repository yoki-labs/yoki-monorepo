import type { Command } from "./Command";

const Kill: Command = {
    name: "kill",
    description: "Turn the bot off",
    hidden: true,
    usage: "",
    devOnly: true,
    execute: (message, _args, ctx) => {
        ctx.errorHandler.send("Bot is shutting down!").catch(() => void 0);
        ctx.ws.destroy();
        ctx.prisma.$disconnect().catch(() => void 0);
        ctx.redis.quit().catch(() => void 0);
        return ctx.messageUtil.send(message.channelId, "Shutting down...");
    },
};

export default Kill;
