import Collection from "@discordjs/collection";
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
        {
            name: "subName",
            type: "string",
            optional: true,
        },
    ],
    execute: (message, args, ctx, commandCtx) => {
        const commandName = (args.commandName as string | null)?.toLowerCase();
        const subName = (args.subName as string | null)?.toLowerCase();
        if (commandName) {
            const parentCommand = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
            if (!parentCommand) return ctx.messageUtil.send(message.channelId, "Could not find that command!");
            let command: Command;
            if (subName) {
                const subCommand = parentCommand.subCommands?.get(subName) ?? null;
                if (!subCommand) return ctx.messageUtil.send(message.channelId, "Could not find that sub command!");
                command = subCommand;
            } else {
                command = parentCommand;
            }

            const commandUsageName = parentCommand.name === command.name ? command.name : `${parentCommand.name}${command.subName ? ` ${command.subName}` : ""}`;
            return ctx.messageUtil.sendContentBlock(
                message.channelId,
                `${inlineCodeblock(commandUsageName)} command`,
                [
                    command.description,
                    " ",
                    `**Usage:** ${inlineCodeblock(
                        `${commandCtx.server.getPrefix()}${commandUsageName} ${
                            command.usage ?? `<${command.subCommands?.size ? command.subCommands!.map((x) => x.subName!).join(" | ") : ""}> <...args>`
                        }`
                    )}`,
                    command.examples ? `**Examples:** ${listInlineCodeblock(command.examples.map((x) => `${commandCtx.server.getPrefix()}${commandUsageName} ${x}`))}` : null,
                    command.aliases ? `**Aliases:** ${listInlineCodeblock(command.aliases)}` : null,
                    command.subCommands?.size ? `**Subcommands:** ${listInlineCodeblock(command.subCommands!.map((x) => x.subName!))}` : null,
                    command.clientPermissions ? `**Required Bot Permissions:** ${listInlineCodeblock(command.clientPermissions)}` : null,
                    command.requiredRole ? `**Required Role:** ${inlineCodeblock(command.requiredRole)}` : null,
                ]
                    .filter(Boolean)
                    .join("\n")
            );
        }

        const commandCategoryMap: Collection<string, Command[]> = new Collection();
        [...categories, undefined].forEach((category) => {
            const commands = Array.from(ctx.commands.filter((x) => x.category === category && !x.subCommand && !x.hidden).values());
            commandCategoryMap.set(category ?? "uncategorized", commands);
        });

        return ctx.messageUtil.sendContentBlock(
            message.channelId,
            "Command List",
            `For additional info on a command, type ${inlineCodeblock(`${commandCtx.server.getPrefix()}help [command]`)}

            ${commandCategoryMap
                .map(
                    (commands, category) => stripIndents`
                            **${category}:**
                            ${listInlineCodeblock(commands.map((x) => x.name))}
                        `
                )
                .join("\n\n")}
				
			:link: [Join server](https://guilded.gg/Yoki) • [Invite bot](https://guilded.gg/Yoki)
			`
        );
    },
};

export default Help;
