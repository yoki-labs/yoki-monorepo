import { generateCaptcha } from "../../utils/antiraid";
import { Category } from "../Category";
import type { Command } from "../Command";

const Solve: Command = {
    name: "solve",
    description: "Solve the current captcha.",
    usage: "<code>",
    aliases: ["verify"],
    examples: ["djAshAJ"],
    category: Category.Antiraid,
    hidden: true,
    subCommand: true,
    subName: "solve",
    args: [{ name: "code", type: "string" }],
    execute: async (message, args, ctx, commandCtx) => {
        const code = args.code as string;
        const captcha = await ctx.prisma.captcha.findFirst({
            where: {
                serverId: message.serverId!,
                triggeringUser: message.createdBy,
                solved: false,
            },
        });

        if (!captcha) return ctx.messageUtil.reply(message, { content: "You do not have an active captcha!" });
        if (code.toLowerCase() !== captcha.value) {
            void ctx.amp.logEvent({ event_type: "CAPTCHA_FAIL", user_id: message.createdBy, event_properties: { serverId: message.serverId } });
            const { value, url } = await generateCaptcha(ctx.s3, captcha.id);
            await ctx.prisma.captcha.update({ where: { id: captcha.id }, data: { value, url } });
            return ctx.messageUtil.replyWithError(
                message,
                `Incorrect code`,
                `The code you sent is invalid. A new captcha has been generated for you:`,
                { image: { url } },
                { isPrivate: true }
            );
        }

        await ctx.prisma.captcha.update({ where: { id: captcha.id }, data: { solved: true } });
        if (commandCtx.server.muteRoleId) await ctx.rest.router.removeRoleFromMember(message.serverId!, message.createdBy, commandCtx.server.muteRoleId).catch(() => null);
        void ctx.amp.logEvent({ event_type: "CAPTCHA_SUCCESS", user_id: message.createdBy, event_properties: { serverId: message.serverId } });
        return ctx.messageUtil.reply(message, { content: "Congrats! You solved the captcha. You may now use the rest of the server." });
    },
};

export default Solve;
