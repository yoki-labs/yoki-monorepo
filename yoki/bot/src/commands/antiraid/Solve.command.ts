import { generateCaptcha } from "../../utils/antiraid";
import { Category, Command } from "../commands";

const Solve: Command = {
    name: "solve",
    description: "Solve the captcha required to enter the server.",
    // usage: "<code>",
    aliases: ["verify"],
    examples: ["djAshAJ"],
    category: Category.Entry,
    hidden: true,
    subCommand: true,
    subName: "solve",
    args: [{ name: "code", type: "string" }],
    execute: async (message, args, ctx, { server, member }) => {
        const code = args.code as string;
        const captcha = await ctx.prisma.captcha.findFirst({
            where: {
                serverId: message.serverId!,
                triggeringUser: message.authorId,
                solved: false,
            },
        });

        if (!captcha) return ctx.messageUtil.replyLegacy(message, { content: "You do not have an active captcha!" });
        if (code.toLowerCase() !== captcha.value) {
            void ctx.amp.logEvent({ event_type: "CAPTCHA_FAIL", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
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
        if (server.muteRoleId) await ctx.roles.removeRoleFromMember(message.serverId!, message.authorId, server.muteRoleId).catch(() => null);
        if (server.memberRoleId) await ctx.roles.addRoleToMember(message.serverId!, message.authorId, server.memberRoleId).catch(() => null);
        void ctx.amp.logEvent({ event_type: "CAPTCHA_SUCCESS", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

        await ctx.supportUtil.handleWelcome(server, member);

        return ctx.messageUtil.replyLegacy(message, { content: "Congrats! You solved the captcha. You may now use the rest of the server." });
    },
};

export default Solve;
