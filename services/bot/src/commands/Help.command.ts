import { stripIndents } from "common-tags";

import { inlineCodeblock, listInlineCodeblock } from "../formatters";
import type { Command } from "./Command";

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
				**Usage:** ${inlineCodeblock(`${commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX}${command.name} ${command.usage}`)}
				${command.examples ? `**Examples:** ${listInlineCodeblock(command.examples.map((x) => (command.parentCommand ? command.name : "") + x))}` : ""}
				${command.userPermissions ? `**User Required Permissions:** ${listInlineCodeblock(command.userPermissions)}` : ""}
				${command.clientPermissions ? `**Client Required Permissions:** ${listInlineCodeblock(command.clientPermissions)}` : ""}
				${command.requiredRole ? `**Required Role:** ${inlineCodeblock(command.requiredRole)}` : ""}
				**Has sub-commands:** ${inlineCodeblock(String(command.parentCommand))}
			`
            );
        }

        const commandsWithSub = ctx.commands.filter((x) => !x.hidden && Boolean(x.parentCommand && x.subCommands!.size));
        const filteredCommands = ctx.commands.filter((x) => !x.subCommands?.size && !x.subCommand && !x.hidden);
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				A list of available commands. For additional info on a command, type ${inlineCodeblock(`${commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX}help [command]`)}. 
				Categories marked with * are commands that contain sub commands.

				**Uncategorized:**
				${listInlineCodeblock(filteredCommands.map((x) => x.name))}

				${commandsWithSub
                    .map(
                        (x) => stripIndents`
						**${x.name}\*:**
						${listInlineCodeblock(x.subCommands!.map((command) => command.subName as string))}
					`
                    )
                    .join("\n")}
		`
        );
    },
};

export default Help;
