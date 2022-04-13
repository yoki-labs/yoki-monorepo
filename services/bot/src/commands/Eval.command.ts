import { stripIndents } from "common-tags";
import fetch from "node-fetch";
import { inspect } from "util";

import type { Command } from "./Command";

const _clean = async (text: any) => {
    if (text?.then && text.catch) text = await text;
    if (typeof text !== "string") text = inspect(text, { depth: 0 });

    return (text as string)
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`)
        .replace(process.env.GUILDED_TOKEN!, "this is supposed to be the bot's token");
};

const _tooLong = (body: string): Promise<string> => {
    return fetch("https://paste.discord.land/documents", { method: "POST", body }).then((d) => d.json().then((v) => v.key));
};

const Eval: Command = {
    name: "eval",
    description: "[PRIVATE]",
    usage: "",
    ownerOnly: true,
    execute: async (message, _args, ctx, commandCtx) => {
        const code = commandCtx.packet.d.message.content.slice(`${commandCtx.server.prefix}eval`.length);
        if (!code) return ctx.messageUtil.send(message.channelId, "Gotta give me something to eval there chief.");
        const codeblock = (content: string) => `\`\`\`js\n${content}\`\`\``;
        try {
            const evaled = eval(`(async () => {${code}})()`); // eslint-disable-line no-eval
            const clean = await _clean(evaled);
            const final = stripIndents`
                📥 **Input**
                ${codeblock(code)}
                📤 **Output**
                ${codeblock(clean)}
                `;

            if (final.length > 2000) {
                const key = await _tooLong(clean);
                return ctx.messageUtil.send(
                    message.channelId,
                    `Output exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`
                );
            }

            await ctx.messageUtil.send(message.channelId, final);
        } catch (e) {
            const clean = await _clean(e);
            const final = stripIndents`
                📥 **Input**
                ${codeblock(code)}
                📤 **Error**
                ${codeblock(clean)}
                `;

            if (final.length > 2000) {
                const key = await _tooLong(clean);
                return ctx.messageUtil.send(
                    message.channelId,
                    `Error exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`
                );
            }

            await ctx.messageUtil.send(message.channelId, final);
        }
        return void 0;
    },
};

export default Eval;
