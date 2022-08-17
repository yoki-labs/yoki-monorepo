import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed } from "@guildedjs/webhook-client";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import boolean from "../args/boolean";
import channel from "../args/channel";
import enumArg from "../args/enum";
import enumList from "../args/enumList";
import member from "../args/member";
import number from "../args/number";
import rest from "../args/rest";
import string from "../args/string";
import UUID from "../args/UUID";
import type { CommandArgType, CommandArgument } from "../commands/Command";
import { FilteredContent } from "../modules/content-filter";
import type { Context, ResolvedArgs, Server, UsedMentions } from "../typings";
import client from "../utils/amplitude";
import { Colors } from "../utils/color";
import { codeBlock, inlineCode } from "../utils/formatters";
import { roleValues } from "../utils/util";

const argCast: Record<
    CommandArgType,
    (
        input: string,
        rawArgs: string[],
        index: number,
        ctx: Context,
        packet: WSChatMessageCreatedPayload,
        argument: CommandArgument,
        usedMentions: UsedMentions
    ) => ResolvedArgs | Promise<ResolvedArgs>
> = {
    string,
    number,
    boolean,
    enum: enumArg,
    enumList,
    rest,
    UUID,
    member,
    channel,
};

export default async (packet: WSChatMessageCreatedPayload, ctx: Context, server: Server) => {
    const { message } = packet.d;
    // if the message wasn't sent in a server, or the person was a bot then don't do anything
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    void client.logEvent({ event_type: "MESSAGE_CREATED", event_properties: { serverId: message.serverId, authorId: message.createdBy } });
    const isModmailChannel = await ctx.prisma.modmailThread.findFirst({
        where: { serverId: message.serverId, userFacingChannelId: message.channelId, openerId: message.createdBy, closed: false },
    });
    if (isModmailChannel) {
        void client.logEvent({ event_type: "MODMAIL_MESSAGE", event_properties: { serverId: message.serverId!, modmailId: isModmailChannel.id } });
        void ctx.rest.router.deleteChannelMessage(message.channelId, message.id);
        const member = await ctx.serverUtil.getMember(message.serverId, message.createdBy, true, true);
        const newModmailMessage = await ctx.rest.router.createChannelMessage(isModmailChannel.modFacingChannelId, {
            embeds: [
                {
                    description: message.content,
                    author: {
                        icon_url: member.user.avatar,
                        name: `${member.user.name} (${member.user.id})`,
                    },
                    color: Colors.yellow,
                    footer: {
                        text: message.id,
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        return ctx.prisma.modmailMessage.create({
            data: {
                authorId: message.createdBy,
                channelId: message.channelId,
                content: message.content,
                originalMessageId: message.id,
                sentMessageId: newModmailMessage.message.id,
                modmailThreadId: isModmailChannel.id,
            },
        });
    }

    // the prefix of this server, otherwise the fallback default prefix
    const prefix = server.getPrefix();

    // if the message does not start with the prefix
    if (!message.content.startsWith(prefix)) {
        const member = await ctx.serverUtil.getMember(message.serverId, message.createdBy).catch(() => null);
        if (member?.user.type === "bot") return;

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
        void client.logEvent({ event_type: "MESSAGE_TEXT_SCANNED", event_properties: { serverId: message.serverId, authorId: message.createdBy } });

        // Spam prevention
        if (server.filterEnabled) {
            void client.logEvent({ event_type: "MESSAGE_SPAM_SCANNED", event_properties: { serverId: message.serverId, authorId: message.createdBy } });
            await ctx.spamFilterUtil.checkForMessageSpam(server, message);
        }

        // Invites or bad URLs
        if (server.filterEnabled || server.filterInvites) {
            void client.logEvent({ event_type: "MESSAGE_LINKS_SCANNED", event_properties: { serverId: message.serverId, authorId: message.createdBy } });
            await ctx.linkFilterUtil.checkLinks({
                server,
                userId: message.createdBy,
                channelId: message.channelId,
                content: message.content,
                filteredContent: FilteredContent.Message,
                resultingAction: () => ctx.rest.router.deleteChannelMessage(message.channelId, message.id),
            });
        }

        if (server.premium && server.scanNSFW) {
            void client.logEvent({ event_type: "MESSAGE_MEDIA_SCANNED", event_properties: { serverId: message.serverId, authorId: message.createdBy } });
            await ctx.contentFilterUtil.scanMessageMedia({ channelId: message.channelId, messageId: message.id, userId: message.createdBy, content: message.content });
        }

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
    if (!command) {
        const customCommand = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: commandName } });
        if (!customCommand) return client.logEvent({ event_type: "INVALID_COMMAND", event_properties: { serverId: message.serverId, authorId: message.createdBy } });
        return ctx.messageUtil.send(message.channelId, customCommand.content);
    }

    // for sub commands
    let parentCommand = command;

    while (command.parentCommand && command.subCommands?.size) {
        parentCommand = command;
        // if no sub command, list all the available sub commands
        if (!args[0]) {
            void client.logEvent({
                event_type: "COMMAND_MISSING_SUBCOMMAND",
                event_properties: { serverId: message.serverId, authorId: message.createdBy, command: command.name },
            });
            const subCommandName = command.subCommands.firstKey();
            const subCommand = command.subCommands.get(subCommandName as string)!;

            return ctx.messageUtil.replyWithInfo(message, `${inlineCode(commandName)} command`, command.description, {
                fields: [
                    {
                        name: "Available sub-commands",
                        value: command.subCommands.map((x) => `- ${inlineCode(x.subName!)}`).join("\n"),
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
        if (!subCommand) {
            void client.logEvent({
                event_type: "COMMAND_INVALID_SUBCOMMAND",
                event_properties: { serverId: message.serverId, authorId: message.createdBy, command: command.name },
            });
            return ctx.messageUtil.replyWithAlert(message, `No such sub-command`, `The specified sub-command could not be found.`, {
                fields: [
                    {
                        name: "Available sub-commands",
                        value: command.subCommands.map((x) => `- ${inlineCode(x.subName!)}`).join("\n"),
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
        }
        command = subCommand;
        // remove the sub command from the list of args, as that's the command name
        args = args.slice(1);
    }

    // the object of casted args casted to their proper types
    const resolvedArgs: Record<string, ResolvedArgs> = {};
    const usedMentions: UsedMentions = { user: 0, role: 0, channel: 0 };
    // if this command has accepts args
    if (command.args?.length) {
        // go through all the specified arguments in the command
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];

            // if the argument is not a rest type, is optional, and the actual argument is undefined, continue next in the args
            if (commandArg.optional && args.length <= i) {
                resolvedArgs[commandArg.name] = null;
                continue;
            }

            // run the caster and see if the arg is valid
            const castArg = args[i] ? await argCast[commandArg.type](args[i], args, i, ctx, packet, commandArg, usedMentions) : null;

            // if the arg is not valid, inform the user
            if (castArg === null || (commandArg.max && ((castArg as any).length ?? castArg) > commandArg.max)) {
                void client.logEvent({
                    event_type: "COMMAND_BAD_ARGS",
                    event_properties: { serverId: message.serverId, authorId: message.createdBy, command: command.name, trippedArg: commandArg },
                });
                return ctx.messageUtil.handleBadArg(message, prefix, commandArg, command, parentCommand);
            }

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
            if (!userModRoles.some((role) => roleValues[role.type] >= requiredValue)) {
                void client.logEvent({
                    event_type: "COMMAND_INVALID_USER_PERMISSIONS",
                    event_properties: { serverId: message.serverId, authorId: message.createdBy, command: command.name },
                });
                return ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing the ${command.requiredRole} role permission!`);
            }
            // if this command is operator only, then silently ignore because of privacy reasons
        } else if (command.devOnly) return void 0;
    }

    try {
        void client.logEvent({ event_type: "COMMAND_RAN", event_properties: { serverId: message.serverId!, command: command.name } });
        // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
        // and the command context (raw packet, database server entry, member from API or cache)
        await command.execute(message, resolvedArgs, ctx, { packet, server, member });
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
						Error: \`\`\`${e.stack ?? e.message}\`\`\`
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
    void client.flush();
    return void 0;
};
