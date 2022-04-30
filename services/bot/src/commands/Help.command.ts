import Collection from "@discordjs/collection";
import { Embed } from "@guildedjs/embeds";
import { stripIndents } from "common-tags";

import { inlineCodeblock, listInlineCodeblock } from "../formatters";
import { Category } from "./Category";
import type { Command } from "./Command";
const categories = Object.values(Category);

const Help: Command = {
    name: "help",
    description: "Send a list of all commands",
    usage: "[commandName]",
    hidden: true,
    args: [
        {
            name: "commandName",
            type: "string",
            optional: true,
        },
    ],
    execute: (message, args, ctx, commandCtx) => {
        const commandName = args.commandName as string | null;
        if (commandName) {
            const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
            if (!command) return ctx.messageUtil.send(message.channelId, "Could not find that command!");

            return ctx.messageUtil.send(
                message.channelId,
                stripIndents`
					**Name:** ${inlineCodeblock(command.name)}
					${command.aliases ? `**Aliases:** ${listInlineCodeblock(command.aliases)}` : ""}
					**Description:** ${inlineCodeblock(command.description)}
					**Usage:** ${inlineCodeblock(
                        `${commandCtx.server.getPrefix()}${command.name} ${
                            command.usage ?? `<${command.subCommands?.size ? command.subCommands!.map((x) => x.subName!).join(" | ") : ""}> <...args>`
                        }`
                    )}
					${command.examples ? `**Examples:** ${listInlineCodeblock(command.examples.map((x) => `${commandCtx.server.getPrefix()}${command.parentCommand ? command.name : ""} ${x}`))}` : ""}
					${command.userPermissions ? `**Required User Permissions:** ${listInlineCodeblock(command.userPermissions)}` : ""}
					${command.clientPermissions ? `**Required Bot Permissions:** ${listInlineCodeblock(command.clientPermissions)}` : ""}
					${command.requiredRole ? `**Required Role:** ${inlineCodeblock(command.requiredRole)}` : ""}
					${command.subCommands?.size ? `**Subcommands:** ${listInlineCodeblock(command.subCommands!.map((x) => x.subName!))}` : ""}
			`
            );
        }

        const commandCategoryMap: Collection<string, Command[]> = new Collection();
        [...categories, undefined].forEach((category) => {
            const commands = Array.from(ctx.commands.filter((x) => x.category === category && !x.subCommand && !x.hidden).values());
            commandCategoryMap.set(category ?? "uncategorized", commands);
        });

        return ctx.messageUtil.send(
            message.channelId,
            new Embed().setDescription(stripIndents`
				A list of available commands. For additional info on a command, type ${inlineCodeblock(`${commandCtx.server.getPrefix()}help [command]`)}. 

				${commandCategoryMap
                    .map(
                        (commands, category) => stripIndents`
						**${category}:**
						${listInlineCodeblock(commands.map((x) => x.name))}
					`
                    )
                    .join("\n\n")}
		`)
        );
    },
};

export default Help;
