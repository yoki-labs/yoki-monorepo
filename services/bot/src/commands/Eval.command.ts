import { stripIndents } from "common-tags";
import { inspect } from "node:util";
import fetch from "node-fetch";

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

const format = (first: string, second: string) => stripIndents`
	📥 **Input**
	${first
        .split("\n")
        .map((x) => `\`${x.trim()}\``)
        .join("\n")}
	📤 **Output**
	${second
        .split("\n")
        .map((x) => `\`${x.trim()}\``)
        .join("\n")}
	`;

const Eval: Command = {
    name: "eval",
    description: "[PRIVATE]",
    hidden: true,
    usage: "",
    ownerOnly: true,
    execute: async (message, _args, ctx, commandCtx) => {
        const code = commandCtx.packet.d.message.content.slice(`${commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX}eval`.length).trim();
        console.log(code);
        if (!code) return ctx.messageUtil.send(message.channelId, "Gotta give me something to eval there chief.");
        let evaled;
        try {
            evaled = await eval(`(async () => {${code}})()`); // eslint-disable-line no-eval
        } catch (e) {
            evaled = e;
        }
        const clean = await _clean(evaled);
        const final = format(code, clean);

        if (final.length > 2000) {
            const key = await _tooLong(clean);
            return ctx.messageUtil.send(message.channelId, `Output exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`);
        }

        return ctx.messageUtil.send(message.channelId, final);
    },
};

export default Eval;
