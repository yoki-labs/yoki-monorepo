import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import boolean from "../args/boolean";
import enumArg from "../args/enum";
import enumList from "../args/enumList";
import member from "../args/member";
import number from "../args/number";
import rest from "../args/rest";
import string from "../args/string";
import UUID from "../args/UUID";
import type { CommandArgType, CommandArgument } from "../commands/Command";
import { codeBlock, inlineCode } from "../formatters";
import { languages } from "../language";
import { FilteredContent } from "../modules/content-filter";
import type { Context, ResolvedArgs, Server } from "../typings";
import { roleValues } from "../util";

const argCast: Record<
    CommandArgType,
    (input: string, rawArgs: string[], index: number, ctx: Context, packet: WSChatMessageCreatedPayload, argument: CommandArgument) => ResolvedArgs | Promise<ResolvedArgs>
> = {
    string,
    number,
    boolean,
    enum: enumArg,
    enumList,
    rest,
    UUID,
    member,
};

export default async (packet: WSChatMessageCreatedPayload, ctx: Context, server: Server) => {
    const { message } = packet.d;
    // if the message wasn't sent in a server, or the person was a bot then don't do anything
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    // the prefix of this server, otherwise the fallback default prefix
    const prefix = server.getPrefix();

    // if the message does not start with the prefix
    if (!message.content.startsWith(prefix)) {
        // store the message in the database
        await ctx.dbUtil.storeMessage(message).catch(console.log);
        // scan the message for any harmful content (filter list, presets)
        await ctx.contentFilterUtil.scanContent({
            userId: message.createdByBotId || message.createdByWebhookId || message.createdBy,
            text: message.content,
            filteredContent: FilteredContent.Message,
            channelId: message.channelId,
            server,
            // Filter
            resultingAction: () => ctx.rest.router.deleteChannelMessage(message.channelId, message.id),
        });
        if (server.premium)
            await ctx.contentFilterUtil.scanMessageMedia({ channelId: message.channelId, messageId: message.id, userId: message.createdBy, content: message.content });
        return;
    }

    // parse the message into the command name and args ("?test arg1 arg2 arg3" = [ "test", "arg1", "arg2", "arg3" ])
    let [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
    // if no command name, don't do anything
    if (!commandName) return void 0;
    // lowercase the command name
    commandName = commandName.toLowerCase();

    // get the command by the name or if it's an alias of a command
    let command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
    // if not a valid command, don't do anything
    if (!command) return;

    // for sub commands
    const parentCommand = command;
    // if this is a command that has sub commands, run this
    if (command.parentCommand && command.subCommands?.size) {
        // if no sub command, list all the available sub commands
        if (!args[0]) {
            const subCommandName = command.subCommands.firstKey();
            const subCommand = command.subCommands.get(subCommandName as string)!;

            return ctx.messageUtil.replyWithInfo(message, `${inlineCode(commandName)} command`, command.description, {
                fields: [
                    {
                        name: "Available sub-commands",
                        value: `- ${command.subCommands.map((x) => inlineCode(x.name.split("-")[1])).join("\n- ")}`,
                        inline: true,
                    },
                    {
                        name: "Example",
                        value: stripIndents`
                                \`\`\`md
                                ${prefix}${commandName} ${subCommandName} ${subCommand.examples ? subCommand.examples[0] : ""}
                                \`\`\`
                            `,
                        inline: true,
                    },
                ],
            });
        }
        const subCommand = command.subCommands.get(args[0]);
        // if not a valid sub command, list all the proper ones
        if (!subCommand)
            return ctx.messageUtil.replyWithAlert(message, `No such sub-command`, `The specified sub-command could not be found.`, {
                fields: [
                    {
                        name: "Available sub-commands",
                        value: `- ${command.subCommands.map((x) => inlineCode(x.name.split("-")[1])).join("\n- ")}`,
                        inline: true,
                    },
                    {
                        name: "Example",
                        value: stripIndents`
                                        ${prefix}${commandName} ${command.subCommands.firstKey()}
                                    `,
                        inline: true,
                    },
                ],
            });
        command = subCommand;
        // remove the sub command from the list of args, as that's the command name
        args = args.slice(1);
    }

    // the object of casted args casted to their proper types
    const resolvedArgs: Record<string, ResolvedArgs> = {};
    // if this command has accepts args
    if (command.args?.length) {
        // go through all the specified arguments in the command
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];

            // if the argument is not a rest type, is optional, and the actual argument is undefined, continue next in the args
            if (commandArg.optional && typeof args[i] == "undefined") continue;

            // run the caster and see if the arg is valid
            const castArg = await argCast[commandArg.type]?.(args[i], args, i, ctx, packet, commandArg);

            // if the arg is not valid, inform the user
            if (!castArg || (commandArg.max && ((castArg as any).length ?? castArg) > commandArg.max))
                return ctx.messageUtil.handleBadArg(message, prefix, commandArg, command, parentCommand);

            // if the arg is valid, add it to the resolved args obj
            resolvedArgs[commandArg.name] = castArg;
        }
    }

    // fetch the member from either the server or the redis cache
    const member = await ctx.serverUtil.getMember(message.serverId, message.createdBy);

    // check if this user is not an operator
    if (!ctx.operators.includes(message.createdBy)) {
        // if this command requires a user to have a specific role, then check if they have it
        if (command.requiredRole && !member.isOwner) {
            // get all the roles of the required type for this command
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId } });
            const userModRoles = modRoles.filter((modRole) => member.roleIds.includes(modRole.roleId));
            const requiredValue = roleValues[command.requiredRole];
            // check if the user has any of the roles of this required type
            if (!userModRoles.some((role) => roleValues[role.type] >= requiredValue))
                return ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing the ${command.requiredRole} role permission!`);
            // if this command is operator only, then silently ignore because of privacy reasons
        } else if (command.devOnly) return void 0;
    }

    try {
        // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
        // and the command context (raw packet, database server entry, member from API or cache)
        await command.execute(message, resolvedArgs, ctx, { packet, server, member, language: languages[server.locale] });
    } catch (e) {
        // ID for error, not persisted in database at all
        const referenceId = nanoid();
        if (e instanceof Error) {
            console.error(e);
            // send the error to the error channel
            void ctx.errorHandler.send("Error in command usage!", [
                new Embed()
                    .setDescription(
                        stripIndents`
						Reference ID: ${inlineCode(referenceId)}
						Server: ${inlineCode(message.serverId)}
						Channel: ${inlineCode(message.channelId)}
						User: ${inlineCode(message.createdBy)} (${inlineCode(member?.user.name)})
						Error: \`\`\`
						${e.stack ?? e.message}
						\`\`\`
					`
                    )
                    .addField(`Content`, codeBlock(message.content?.length > 1018 ? `${message.content.substring(0, 1018)}...` : message.content))
                    .setColor("RED"),
            ]);
        }
        // notify the user that there was an error executing the command
        return ctx.messageUtil.replyWithError(
            message,
            `This is potentially an issue on our end, please contact us and forward the following ID and error: ${inlineCode(referenceId)} & ${inlineCode((e as any).message)}`
        );
    }

    return void 0;
};
