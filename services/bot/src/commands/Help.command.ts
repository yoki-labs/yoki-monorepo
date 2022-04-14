import { stripIndents } from "common-tags";

import type { Command } from "./Command";
import { RoleType } from ".prisma/client";

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
				**Name:** \`${command.name}\`
				${command.aliases ? `**Aliases:** ${command.aliases.map((x) => `\`${x}\``).join(", ")}` : ""}
				**Description:** \`${command.description}\`
				**Usage:** \`${commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX}${command.name} ${command.usage}\`
				${command.examples ? `**Examples:** ${command.examples.map((x) => `\`${command.parentCommand ? `${command.name} ` : ""}${x}\``).join(", ")}` : ""}
				${command.userPermissions ? `**User Required Permissions:** ${command.userPermissions.map((x) => `\`${x}\``).join(", ")}` : ""}
				${command.clientPermissions ? `**Client Required Permissions:** ${command.clientPermissions.map((x) => `\`${x}\``).join(", ")}` : ""}
				**Mod Only:** \`${command.requiredRole === RoleType.MOD}\`
				**Admin Only:** \`${command.requiredRole === RoleType.ADMIN}\`
				**Has sub-commands:** \`${command.parentCommand ?? false}\`
			`
            );
        }

        const commandsWithSub = ctx.commands.filter((x) => Boolean(x.parentCommand && x.subCommands!.size));
        const filteredCommands = ctx.commands.filter((x) => !x.subCommands?.size && !x.subCommand && !x.hidden);
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				A list of available commands.
				For additional info on a command, type \`${commandCtx.server.prefix ?? process.env.DEFAULT_PREFIX}help [command]\`


				Categories marked with * are commands that contain sub commands.

				**Uncategorized:**
				${filteredCommands.map((x) => `\`${x.name}\``).join(", ")}

				${commandsWithSub
                    .map(
                        (x) => stripIndents`
						**${x.name}\*:**
						${x.subCommands!.map((command) => `\`${command.subName}\``).join(", ")}
					`
                    )
                    .join("\n")}
		`
        );
    },
};

export default Help;
