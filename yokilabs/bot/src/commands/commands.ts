import { codeBlock, inlineCode, inlineQuote } from "@yokilabs/util";
import { stripIndents } from "common-tags";
import { Member, Message, WebhookEmbed } from "guilded.js";

// import { nanoid } from "nanoid";
import booleanArg from "../args/boolean";
import channel from "../args/channel";
import enumArg from "../args/enum";
import enumList from "../args/enumList";
import member from "../args/member";
import number from "../args/number";
import rest from "../args/rest";
import stringArg from "../args/string";
import UUID from "../args/UUID";
import type { AbstractClient } from "../Client";
import type { IRole, IServer } from "../db-types";
import type { UsedMentions } from "./arguments";
import type { BaseCommand, CommandArgType, CommandArgValidator } from "./command-typings";

export function createCommandHandler<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, TRoleType, TServer>,
    TRoleType extends string
>(roleValues: Record<TRoleType, number>) {
    const argumentConverters: Record<CommandArgType, CommandArgValidator> = {
        boolean: booleanArg,
        channel,
        enum: enumArg,
        enumList,
        member,
        number,
        rest,
        string: stringArg,
        UUID,
    };

    type AsyncUnit = Promise<unknown> | undefined;

    // Lambda incase JS detects there is no context in lambdas from the object and garbage collects the object
    return {
        fetchPrefix: async (
            onNext: (context: [Message, TClient], server: TServer, prefix: string) => Promise<unknown> | undefined,
            context: [Message, TClient],
            server: TServer
        ) => {
            const prefix = server.prefix ?? process.env.DEFAULT_PREFIX!;

            return onNext(context, server, prefix);
        },
        parseCommand: async (
            executeCommand: (
                context: [Message, TClient],
                server: TServer,
                prefix: string,
                command: TCommand | undefined,
                commandName: string,
                args: string[]
            ) => Promise<unknown> | undefined,
            context: [Message, TClient],
            server: TServer,
            prefix: string
        ) => {
            const [message, ctx] = context;

            // Parse the message into the command name and args ("?test arg1 arg2 arg3" = [ "test", "arg1", "arg2", "arg3" ])
            let [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

            if (!commandName) return void 0;

            commandName = commandName.toLowerCase();

            // Get the command by the name or if it's an alias of a command
            const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);

            return executeCommand(context, server, prefix, command, commandName, args);
        },
        fetchCommandInfo: async (
            onNext: (context: [Message, TClient], server: TServer, prefix: string, command: TCommand, args: string[]) => AsyncUnit,
            context: [Message, TClient],
            server: TServer,
            prefix: string,
            command: TCommand,
            _commandName: string,
            args: string[]
        ) => {
            const [message, ctx] = context;

            while (command.parentCommand && command.subCommands?.size) {
                // If no sub command, list all the available sub commands
                if (!args[0]) {
                    void ctx.amp.logEvent({
                        event_type: "COMMAND_MISSING_SUBCOMMAND",
                        user_id: message.createdById,
                        event_properties: { serverId: message.serverId, command: command.name },
                    });
                    const subCommandName = command.subCommands.firstKey();
                    const subCommand = command.subCommands.get(subCommandName as string)!;

                    return ctx.messageUtil.replyWithInfo(message, `${inlineCode(command.name.split("-").join(" "))} command`, command.description, {
                        fields: [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(subCommand, prefix)],
                    });
                }
                const subCommand = command.subCommands.get(args[0]);
                // If not a valid sub command, list all the proper ones
                if (!subCommand) {
                    void ctx.amp.logEvent({
                        event_type: "COMMAND_INVALID_SUBCOMMAND",
                        user_id: message.createdById,
                        event_properties: { serverId: message.serverId, command: command.name },
                    });
                    return ctx.messageUtil.replyWithError(message, `No such sub-command`, `The specified sub-command ${inlineQuote(args[0], 100)} could not be found.`, {
                        fields: [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(command, prefix)],
                    });
                }
                command = subCommand;
                // Remove the sub command from the list of args, as that's the command name
                args = args.slice(1);
            }

            return onNext(context, server, prefix, command, args);
        },
        checkUserPermissions: async (
            executeCommand: (context: [Message, TClient], server: TServer, member: Member, prefix: string, command: TCommand, args: string[]) => AsyncUnit,
            getRoles: (ctx: TClient, serverId: string) => Promise<IRole<TRoleType>[]>,
            context: [Message, TClient],
            server: TServer,
            prefix: string,
            command: TCommand,
            args: string[]
        ) => {
            const [message, ctx] = context;
            const { serverId } = message;

            // Fetch the member from either the server or the redis cache
            const member = await ctx.members.fetch(message.serverId!, message.createdById).catch(() => null);
            if (!member) return;

            // Check if this user is not an operator
            if (!ctx.operators.includes(message.createdById)) {
                // If this command requires a user to have a specific role, then check if they have it
                if (command.requiredRole && !member.isOwner) {
                    // Get all the roles of the required type for this command
                    // const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId } });
                    const modRoles = await getRoles(ctx, serverId!);
                    const userModRoles = modRoles.filter((modRole) => member.roleIds.includes(modRole.roleId));
                    const requiredValue = roleValues[command.requiredRole];

                    // check if the user has any of the roles of this required type
                    if (!userModRoles.some((role) => roleValues[role.type] >= requiredValue)) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_INVALID_USER_PERMISSIONS",
                            user_id: message.createdById,
                            event_properties: { serverId: message.serverId },
                        });

                        return ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing the ${inlineCode(command.requiredRole)} role!`);
                    }
                    // if this command is operator only, then silently ignore because of privacy reasons
                } else if (command.devOnly) return void 0;
            }

            return executeCommand(context, server, member, prefix, command, args);
        },
        resolveArguments: async (
            onNext: (context: [Message, TClient], server: TServer, member: Member, command: TCommand, args: Record<string, any>) => AsyncUnit,
            context: [Message, TClient],
            server: TServer,
            member: Member,
            prefix: string,
            command: TCommand,
            args: string[]
        ) => {
            const [message, ctx] = context;

            // The object of casted args casted to their proper types
            const resolvedArgs: Record<string, any> = {};
            const usedMentions: UsedMentions = { user: 0, role: 0, channel: 0 };

            // If this command has accepts args
            if (command.args?.length) {
                // Go through all the specified arguments in the command
                for (let i = 0; i < command.args.length; i++) {
                    const commandArg = command.args[i];

                    // If the argument is not a rest type, is optional, and the actual argument is undefined, continue next in the args
                    if (commandArg.optional && args.length <= i) {
                        resolvedArgs[commandArg.name] = null;
                        continue;
                    }

                    const [argValidator] = argumentConverters[commandArg.type];

                    // run the caster and see if the arg is valid
                    const castArg = args[i] ? await argValidator(args[i], args, i, message, commandArg, usedMentions) : null;

                    // If the arg is not valid, inform the user
                    if (castArg === null || (commandArg.max && ((castArg as any).length ?? castArg) > commandArg.max)) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_BAD_ARGS",
                            user_id: message.createdById,
                            event_properties: { serverId: message.serverId, command: command.name, trippedArg: commandArg },
                        });
                        return ctx.messageUtil.handleBadArg(message, prefix, commandArg, command, argumentConverters, castArg);
                    }

                    // Resolve correctly converted argument
                    resolvedArgs[commandArg.name] = castArg;
                }
            }

            return onNext(context, server, member, command, resolvedArgs);
        },
        tryExecuteCommand: async ([message, ctx]: [Message, TClient], server: TServer, member: Member, command: TCommand, args: Record<string, any>) => {
            try {
                void ctx.amp.logEvent({ event_type: "COMMAND_RAN", user_id: message.createdById, event_properties: { serverId: message.serverId!, command: command.name } });

                // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
                // and the command context (raw packet, database server entry, member from API or cache)
                await command.execute(message, args, ctx, { message, server, member });
            } catch (e) {
                // ID for error, not persisted in database at all
                const referenceId = 10; // nanoid();
                if (e instanceof Error) {
                    console.error(e);
                    // send the error to the error channel
                    void ctx.errorHandler.send("Error in command usage!", [
                        new WebhookEmbed()
                            .setDescription(
                                stripIndents`
                                Reference ID: ${inlineCode(referenceId)}
                                Server: ${inlineCode(message.serverId)}
                                Channel: ${inlineCode(message.channelId)}
                                User: ${inlineCode(message.createdById)} (${inlineCode(member?.user?.name)})
                                Error: \`\`\`${e.stack ?? e.message}\`\`\`
                            `
                            )
                            .addField(`Content`, codeBlock(message.content?.length > 1018 ? `${message.content.substring(0, 1018)}...` : message.content))
                            .setColor("RED"),
                    ]);
                }
                // notify the user that there was an error executing the command
                return ctx.messageUtil.replyWithUnexpected(
                    message,
                    `This is potentially an issue on our end, please contact us and forward the following ID and error: ${inlineCode(referenceId)} & ${inlineCode(
                        (e as any).message
                    )}`
                );
            }
            return void 0;
        },
    };
}
