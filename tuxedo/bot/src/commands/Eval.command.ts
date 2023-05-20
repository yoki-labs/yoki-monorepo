import { inlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { inspect } from "node:util";

// import fetch from "node-fetch";
import type { Command } from "./commands";

const _clean = async (text: any) => {
    if (text?.then && text.catch) text = await text;
    if (typeof text !== "string") text = inspect(text, { depth: 0 });

    return (text as string)
        .replace(/`/g, inlineCode(String.fromCharCode(8203)))
        .replace(/@/g, `@${String.fromCharCode(8203)}`)
        .replace(process.env.GUILDED_TOKEN!, "this is supposed to be the bot's token");
};

// const _tooLong = (body: string): Promise<string> => {
//     return fetch("https://paste.discord.land/documents", { method: "POST", body }).then((d) => d.json().then((v) => (v as { key: string }).key));
// };

const format = (first: string, second: string) => stripIndents`
	📥 **Input**
	${first
        .split("\n")
        .map((x) => inlineCode(x.trim()))
        .join("\n")}
	📤 **Output**
	${second
        .split("\n")
        .map((x) => inlineCode(x.trim()))
        .join("\n")}
	`;

const Eval: Command = {
    name: "eval",
    description: "[PRIVATE]",
    hidden: true,
    usage: "",
    devOnly: true,
    args: [{ type: "rest", name: "code" }],
    // @ts-ignore _ causes italics, which get turned to *
    // eslint-disable-next-line unused-imports/no-unused-vars
    execute: async (message, args, ctx, commandCtx) => {
        const code = args.code as string;
        console.log(code);
        if (!code) return ctx.messageUtil.replyWithError(message, `Code needed`, `Gotta give me something to eval there, chief.`);
        let evaled;
        try {
            evaled = await eval(`(async () => {${code}})()`); // eslint-disable-line no-eval
        } catch (e) {
            evaled = e;
        }
        const clean = await _clean(evaled);
        const final = format(code, clean);

        if (final.length > 2048) {
            // const key = await _tooLong(clean);
            return ctx.messageUtil.replyWithInfo(message, `Output over the limit`, `Output exceeded 2048 characters (${final.length}).`);
        }

        return ctx.messageUtil.replyWithInfo(message, `Eval results`, final);
    },
};

export default Eval;
