import { getAllCommands, replyWithSingleCommand } from "@yokilabs/bot";
import { Colors, inlineCode, listInlineCode } from "@yokilabs/util";
import { Embed } from "guilded.js";
import { Command, Category } from "./commands";
const categories = Object.values(Category) as string[];

const Help: Command = {
    name: "help",
    description: "View a list of Tuxedo's commands.",
    usage: "[command path]",
    examples: ["", "ping"],
    aliases: ["commands", "command", "all", "h"],
    hidden: true,
    args: [
        {
            name: "commandPath",
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
            .setTitle("Tuxedo Command List")
            .setColor(Colors.blockBackground)
            .setDescription(":link: [Join server](https://yoki.gg/support) • [Invite bot](https://yoki.gg/invite)")
            .setFooter(`For additional info on a command, type ${inlineCode(`${commandCtx.server.getPrefix()}help [command]`)}`);

        commandCategoryMap.forEach((value, key) => {
            embed.addField(key in Category ? Category[key] : key, listInlineCode(value.map((x) => x.name))!, value.length < 4);
        });

        return ctx.messageUtil.reply(message, { embeds: [embed.toJSON()] });
    },
};

export default Help;
