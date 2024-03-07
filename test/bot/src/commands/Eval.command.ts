import { inlineCode } from "@yokilabs/bot";
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

const Eval: Command = {
    name: "eval",
    description: "[PRIVATE]",
    hidden: true,
    // usage: "",
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
        const result = await _clean(evaled);

        return ctx.messageUtil.replyWithRichMessage(
            message,
            [
                {
                    object: "block",
                    type: "code-container",
                    data: { language: typeof evaled === "string" ? "unformatted" : "javascript", },
                    nodes: result
                        .substring(0, 4000)
                        .split("\n")
                        .map((line) => ({
                            object: "block",
                            type: "code-line",
                            data: {},
                            nodes: [
                                {
                                    object: "text",
                                    leaves: [
                                        {
                                            object: "leaf",
                                            text: line,
                                            marks: [],
                                        },
                                    ],
                                },
                            ],
                        })),
                }
            ]
        );
    },
};

export default Eval;
