import { Colors, getAllCommands, inlineCode, listInlineCode, replyWithSingleCommand } from "@yokilabs/bot";
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
    execute: (message, args, ctx, commandCtx) => {
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
            .setTitle("Tuxo Command List")
            .setColor(Colors.blockBackground)
            .setDescription(":link: [Join server](https://yoki.gg/support) • [Invite bot](https://yoki.gg/invite)")
            .setFooter(`For additional info on a command, type ${inlineCode(`${commandCtx.server.prefix ?? ctx.prefix}help [command]`)}`);

        commandCategoryMap.forEach((value, key) => {
            embed.addField(key in Category ? Category[key] : key, listInlineCode(value.map((x) => x.name))!, value.length < 4);
        });
        embed.addField(
            ":exclamation: NOTE!!!",
            "Tuxo is still in very early access and may contain bugs or will be missing certain features. Be sure to join [Yoki Labs server](https://yoki.gg/support) and report issues or submit feedback related to it. :heart_gil:"
        );

        return ctx.messageUtil.reply(message, { embeds: [embed] });
    },
};

export default Help;
