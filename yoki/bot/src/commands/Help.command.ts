import { Collection } from "@discordjs/collection";
import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { Colors, inlineCode, inlineQuote, listInlineCode } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Embed, Message } from "guilded.js";

import type Client from "../Client";
import { Category, Command, CommandContext } from "./commands";

const categories = Object.values(Category);

const Help: Command = {
    name: "help",
    description: "View a list of Yoki's commands.",
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
        if (commandPath) return replyWithSingleCommand(ctx, commandCtx, message, commandPath.toLowerCase());

        void ctx.amp.logEvent({
            event_type: "HELP_ALL_COMMANDS",
            user_id: message.authorId,
            event_properties: { serverId: message.serverId! },
        });

        const commandCategoryMap = getAllCommands(ctx.commands);

        const embed = new Embed()
            .setTitle("Command List")
            .setColor(Colors.blockBackground)
            .setDescription(":link: [Join server](https://yoki.gg/support) • [Invite bot](https://yoki.gg/invite)")
            .setFooter(`For additional info on a command, type ${inlineCode(`${commandCtx.server.getPrefix()}help [command]`)}`);

        commandCategoryMap.forEach((value, key) => {
            embed.addField(key in Category ? Category[key] : key, listInlineCode(value.map((x) => x.name))!, value.length < 5);
        });

        return ctx.messageUtil.reply(message, { embeds: [embed] });
    },
};

function getAllCommands(cmds: Client["commands"]) {
    const commandCategoryMap: Collection<string, Command[]> = new Collection();

    for (const category of [...categories, undefined]) {
        const commands = Array.from(cmds.filter((x) => x.category === category && ((!x.subCommand && !x.hidden) || (x.forceShow ?? false))).values());
        commandCategoryMap.set(category ?? "Uncategorized", commands);
    }

    return commandCategoryMap.filter((x) => Boolean(x.length));
}

function replyWithSingleCommand(ctx: Client, commandCtx: CommandContext, message: Message, commandPath: string) {
    // We got 'abc xyz' from the rest arg, so we need ['abc', 'xyz']
    const commandPathSegments = commandPath.split(" ");

    // This will change in the loop as we go through the command path. Starting point is the whole command set
    let subCommandList: Collection<string, Command> | undefined = ctx.commands;
    let command: Command | undefined;

    for (let i = 0; i < commandPathSegments.length; i++) {
        // Since big-brain JS gives "1", "2", "3" instead of 1, 2, 3
        const commandSegment = commandPathSegments[i];

        // No sub-commands; should never occur from ctx.commands, though
        if (!subCommandList)
            return ctx.messageUtil.replyWithError(message, `No sub-commands`, `Command ${inlineCode(commandPathSegments.slice(0, i).join(" "))} has no sub-commands.`);

        command = subCommandList?.get(commandSegment);

        // No sub-command by the specified `commandSegment`
        if (!command) {
            const commandType = i ? "sub-command" : "command";

            return ctx.messageUtil.replyWithError(message, `No such ${commandType}`, `The specified ${commandType} ${inlineQuote(commandSegment, 100)} could not be found.`, {
                fields: i
                    ? ctx.messageUtil.createSubCommandFields(subCommandList)
                    : [
                          {
                              name: "Commands",
                              value: getAllCommands(ctx.commands)
                                  .map(
                                      (commands, category) => stripIndents`
                                        **${category}:**
                                        ${listInlineCode(commands.map((x) => x.name))}
                                    `
                                  )
                                  .join("\n\n"),
                          },
                      ],
            });
        }

        subCommandList = command.subCommands;
    }

    // Peak JS; don't want command! spam
    command = command!;

    const realCommandPath = command.name.split("-").join(" ");

    void ctx.amp.logEvent({
        event_type: "HELP_SINGLE_COMMAND",
        user_id: message.authorId,
        event_properties: { serverId: message.serverId! },
    });

    const fields: (EmbedField | undefined | "")[] = command.subCommands ? ctx.messageUtil.createSubCommandFields(command.subCommands) : [];
    const prefix = commandCtx.server.getPrefix();

    // To not have fields for each one of them
    const additionalInfo = [
        command.aliases && `**Alias names:** ${listInlineCode(command.aliases)}`,
        command.requiredRole && `**Required role:** ${inlineCode(command.requiredRole.toLowerCase())}`,
        command.clientPermissions && `**Required Bot Permissions:** ${listInlineCode(command.clientPermissions)}`,
    ]
        .filter(Boolean)
        .join("\n");

    return ctx.messageUtil.replyWithInfo(
        message,
        `${inlineCode(realCommandPath)} command`,
        command.description,
        {
            fields: fields
                .concat([
                    // Usage
                    command.args && ctx.messageUtil.createUsageField(command, prefix),
                    // Examples
                    command.examples && ctx.messageUtil.createExampleField(command, prefix),
                    // Additional info
                    additionalInfo && {
                        name: "Additional Info",
                        value: additionalInfo,
                    },
                ])
                .filter(Boolean) as EmbedField[],
        }
        // [
        //     command.description,
        //     " ",
        //     `**Usage:** ${inlineCode(
        //         `${commandCtx.server.getPrefix()}${realCommandPath} ${
        //             command.usage ?? `<${command.subCommands?.size ? command.subCommands!.map((x) => x.subName!).join(" | ") : ""}> <...args>`
        //         }`
        //     )}`,
        //     command.examples ? `**Examples:** ${listInlineCode(command.examples.map((x) => `${commandCtx.server.getPrefix()}${realCommandPath} ${x}`))}` : null,
        //     command.aliases ? `**Aliases:** ${listInlineCode(command.aliases)}` : null,
        //     command.subCommands?.size ? `**Subcommands:** ${listInlineCode(command.subCommands!.map((x) => x.subName!))}` : null,
        //     command.clientPermissions ? `**Required Bot Permissions:** ${listInlineCode(command.clientPermissions)}` : null,
        //     command.requiredRole ? `**Required Role:** ${inlineCode(command.requiredRole)}` : null,
        // ]
        //     .filter(Boolean)
        //     .join("\n")
    );
}

export default Help;
