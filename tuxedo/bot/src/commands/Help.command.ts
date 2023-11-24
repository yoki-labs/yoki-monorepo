import { getAllCommands, inlineCode, listInlineCode, replyWithSingleCommand } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { Embed } from "guilded.js";

import { Category, Command } from "./commands";

const categories = Object.values(Category) as string[];

const Help: Command = {
    name: "help",
    description: "View a list of Tuxo's commands.",
    // usage: "[command path]",
    examples: ["", "ping"],
    aliases: ["commands", "command", "all", "h"],
    hidden: true,
    args: [
        {
            name: "commandPath",
            display: "command path",
            type: "rest",
            optional: true,
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const commandPath = (args.commandPath as string | null)?.toLowerCase();

        // For ?help link url add
        if (commandPath) return replyWithSingleCommand(ctx, commandCtx, message, commandPath.toLowerCase(), categories);

        void ctx.amp.logEvent({
            event_type: "HELP_ALL_COMMANDS",
            user_id: message.createdById,
            event_properties: { serverId: message.serverId },
        });

        const commandCategoryMap = getAllCommands(ctx.commands, categories);

        const embed = new Embed()
            .setTitle("Tuxo Command list")
            .setColor(Colors.blockBackground)
            .setDescription(
                ":link: [Join server](https://yoki.gg/support) \u2022 [Invite bot](https://guilded.gg/b/deabc4d2-ad06-44dd-a053-da4970229b28) \u2022 [Auto-mod](https://www.guilded.gg/b/7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd)"
            )
            .setFooter(`For additional info on a command, type ${inlineCode(`${commandCtx.server.prefix ?? ctx.prefix}help [command]`)}`);

        commandCategoryMap.forEach((value, key) => {
            embed.addField(key in Category ? Category[key] : key, listInlineCode(value.map((x) => x.name))!, value.length < 4);
        });
        // Display server custom incomes
        const customIncomes = (await ctx.dbUtil.getIncomeOverrides(message.serverId!)).filter((x) => x.name);

        if (customIncomes.length) embed.addField(":small_orange_diamond: Server Incomes", listInlineCode(customIncomes.map((x) => x.name) as string[])!);

        // embed.addField(
        //     ":exclamation: NOTE!!!",
        //     "Tuxo is still in early stages. Be sure to join [Yoki Labs server](https://yoki.gg/support) and report any issues you find or to submit feedback. :heart_gil:"
        // );

        return ctx.messageUtil.reply(message, { embeds: [embed] });
    },
};

export default Help;
