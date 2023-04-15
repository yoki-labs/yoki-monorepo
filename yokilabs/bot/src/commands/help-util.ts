import { Collection } from "@discordjs/collection";
import type { EmbedField } from "@guildedjs/guilded-api-typings";
import { inlineCode, inlineQuote, listInlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import type { Message } from "guilded.js";

import type { AbstractClient } from "../Client";
import type { IServer } from "../db-types";
import type { CommandContext } from "../typings";
import type { BaseCommand } from "./command-typings";

export function getAllCommands<TClient extends AbstractClient<any, any, any>, TServer extends IServer, TCommand extends BaseCommand<TCommand, TClient, string, TServer>>(
    cmds: TClient["commands"],
    categories: string[]
) {
    const commandCategoryMap: Collection<string, TCommand[]> = new Collection();

    for (const category of [...categories, undefined]) {
        const commands = Array.from(cmds.filter((x) => x.category === category && ((!x.subCommand && !x.hidden) || (x.forceShow ?? false))).values());
        commandCategoryMap.set(category ?? "Uncategorized", commands);
    }

    return commandCategoryMap.filter((x) => Boolean(x.length));
}

export function replyWithSingleCommand<TClient extends AbstractClient<any, any, any>, TServer extends IServer, TCommand extends BaseCommand<TCommand, TClient, string, TServer>>(
    ctx: TClient,
    commandCtx: CommandContext<TServer>,
    message: Message,
    commandPath: string,
    categories: string[]
) {
    // We got 'abc xyz' from the rest arg, so we need ['abc', 'xyz']
    const commandPathSegments = commandPath.split(" ");

    // This will change in the loop as we go through the command path. Starting point is the whole command set
    let subCommandList: Collection<string, TCommand> | undefined = ctx.commands;
    let command: TCommand | undefined;

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
                              value: getAllCommands(ctx.commands, categories)
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
        user_id: message.createdById,
        event_properties: { serverId: message.serverId },
    });

    const fields: (EmbedField | undefined | "")[] = command.subCommands ? ctx.messageUtil.createSubCommandFields(command.subCommands) : [];
    const prefix = commandCtx.server.prefix ?? ctx.prefix;

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
                    command.usage && ctx.messageUtil.createUsageField(command, prefix),
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
