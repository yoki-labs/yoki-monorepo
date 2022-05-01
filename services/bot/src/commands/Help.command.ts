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
    ],
    execute: (message, args, ctx, commandCtx) => {
        const commandName = args.commandName as string | null;
        if (commandName) {
            const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
            if (!command) return ctx.messageUtil.send(message.channelId, "Could not find that command!");

            return ctx.messageUtil.sendContentBlock(
                message.channelId,
                `${inlineCodeblock(command.name)} command`,
                stripIndents`
                    ${command.description}

                    ${
                        command.examples
                            ? `**Examples:** ${listInlineCodeblock(
                                  command.examples.map((x) => `${commandCtx.server.getPrefix()}${command.parentCommand ? command.name : ""} ${x}`)
                              )}`
                            : ""
                    }
                    **Usage:** ${inlineCodeblock(
                        `${commandCtx.server.getPrefix()}${command.name} ${
                            command.usage ?? `<${command.subCommands?.size ? command.subCommands!.map((x) => x.subName!).join(" | ") : ""}> <...args>`
                        }`
                    )}
                    ${command.aliases ? `**Aliases:** ${listInlineCodeblock(command.aliases)}` : ""}
                    ${command.subCommands?.size ? `**Subcommands:** ${listInlineCodeblock(command.subCommands!.map((x) => x.subName!))}` : ""}
                    ${command.userPermissions ? `**Required User Permissions:** ${listInlineCodeblock(command.userPermissions)}` : ""}
                    ${command.clientPermissions ? `**Required Bot Permissions:** ${listInlineCodeblock(command.clientPermissions)}` : ""}
                    ${command.requiredRole ? `**Required Role:** ${inlineCodeblock(command.requiredRole)}` : ""}
                `
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
            commandCategoryMap
                .map(
                    (commands, category) => stripIndents`
                            **${category}:**
                            ${listInlineCodeblock(commands.map((x) => x.name))}
                        `
                )
                .join("\n\n"),
            {
                fields: [
                    {
                        name: `:question: Command info`,
                        value: `For additional info on a command, type ${inlineCodeblock(`${commandCtx.server.getPrefix()}help [command]`)}`,
                        inline: true,
                    },
                    {
                        name: `:link: [Join server](https://guilded.gg/Yoki) • [Invite bot](https://guilded.gg/Yoki)`,
                        // value: `Get latest news about Yoki and receive support`,
                        value: "",
                        inline: true,
                    },
                ],
            }
        );
    },
};

export default Help;
