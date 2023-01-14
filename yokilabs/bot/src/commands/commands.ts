import type { TeamMemberPayload, WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { Embed } from "@guildedjs/webhook-client";
import { codeBlock, inlineCode, inlineQuote } from "@yokilabs/util";
import { stripIndents } from "common-tags";

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
import type AbstractClient from "../Client";
import type { IRole, IServer } from "../db-types";
import type { UsedMentions } from "./arguments";
import type { BaseCommand, CommandArgument } from "./command-typings";

// const argCast: Record<
//     CommandArgType,
//     (
//         input: string,
//         rawArgs: string[],
//         index: number,
//         ctx: AbstractContext,
//         packet: WSChatMessageCreatedPayload,
//         argument: CommandArgument,
//         usedMentions: UsedMentions
//     ) => ResolvedArgs | Promise<ResolvedArgs>
// > = {
//     string,
//     number,
//     boolean,
//     enum: enumArg,
//     enumList,
//     rest,
//     UUID,
//     member,
//     channel,
// };

type MessagePayload = WSChatMessageCreatedPayload;

export default function createCommandHandler<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, TRoleType, TServer>,
    TRoleType extends string
>(roleValues: Record<TRoleType, number>) {
    type ArgumentConverter = (input: string, rawArgs: string[], index: number, ctx: TClient, packet: MessagePayload, argument: CommandArgument, usedMentions: UsedMentions) => any;

    const argumentConverters: Record<string, ArgumentConverter> = { boolean: booleanArg, channel, enum: enumArg, enumList, member, number, rest, stringArg, UUID };

    type AsyncUnit = Promise<unknown> | undefined;

    // Lambda incase JS detects there is no context in lambdas from the object and garbage collects the object
    return {
        fetchPrefix: async (
            onNext: (packet: MessagePayload, ctx: TClient, server: TServer, prefix: string) => Promise<unknown> | undefined,
            packet: MessagePayload,
            ctx: TClient,
            server: TServer
        ) => {
            const { message } = packet.d;
            console.log("message", message);

            if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

            const prefix = server.prefix ?? process.env.DEFAULT_PREFIX!;
            console.log("Prefix", prefix);

            return onNext(packet, ctx, server, prefix);
        },
        parseCommand: async (
            executeCommand: (packet: MessagePayload, ctx: TClient, server: TServer, prefix: string, command: TCommand | undefined, args: string[]) => Promise<unknown> | undefined,
            packet: MessagePayload,
            ctx: TClient,
            server: TServer,
            prefix: string
        ) => {
            // Parse the message into the command name and args ("?test arg1 arg2 arg3" = [ "test", "arg1", "arg2", "arg3" ])
            let [commandName, ...args] = packet.d.message.content.slice(prefix.length).trim().split(/ +/g);
            console.log("Raw command", [commandName, args]);

            if (!commandName) return void 0;

            commandName = commandName.toLowerCase();

            // Get the command by the name or if it's an alias of a command
            const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);

            console.log("Command", command);

            return executeCommand(packet, ctx, server, prefix, command, args);
        },
        fetchCommandInfo: async (
            onNext: (packet: MessagePayload, ctx: TClient, server: TServer, command: TCommand, args: Record<string, any>) => AsyncUnit,
            packet: MessagePayload,
            ctx: TClient,
            server: TServer,
            prefix: string,
            command: TCommand,
            args: string[]
        ) => {
            const { message } = packet.d;

            while (command.parentCommand && command.subCommands?.size) {
                // If no sub command, list all the available sub commands
                if (!args[0]) {
                    void ctx.amp.logEvent({
                        event_type: "COMMAND_MISSING_SUBCOMMAND",
                        user_id: message.createdBy,
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
                        user_id: message.createdBy,
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

                    // Run the converter and see if the arg is valid
                    const castArg = args[i] ? await argumentConverters[commandArg.type](args[i], args, i, ctx, packet, commandArg, usedMentions) : null;

                    // If the arg is not valid, inform the user
                    if (castArg === null || (commandArg.max && ((castArg as any).length ?? castArg) > commandArg.max)) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_BAD_ARGS",
                            user_id: message.createdBy,
                            event_properties: { serverId: message.serverId, command: command.name, trippedArg: commandArg },
                        });
                        return ctx.messageUtil.handleBadArg(message, prefix, commandArg, command);
                    }

                    // Resolve correctly converted argument
                    resolvedArgs[commandArg.name] = castArg;
                }
            }

            return onNext(packet, ctx, server, command, resolvedArgs);
        },
        checkUserPermissions: async (
            executeCommand: (packet: MessagePayload, ctx: TClient, server: TServer, member: TeamMemberPayload, command: TCommand, args: Record<string, any>) => AsyncUnit,
            getRoles: (ctx: TClient, serverId: string) => Promise<IRole<TRoleType>[]>,
            packet: MessagePayload,
            ctx: TClient,
            server: TServer,
            command: TCommand,
            args: Record<string, any>
        ) => {
            const { message, serverId } = packet.d;

            // Fetch the member from either the server or the redis cache
            const member = await ctx.serverUtil.getMember(message.serverId!, message.createdBy);

            // Check if this user is not an operator
            if (!ctx.operators.includes(message.createdBy)) {
                // If this command requires a user to have a specific role, then check if they have it
                if (command.requiredRole && !member.isOwner) {
                    // Get all the roles of the required type for this command
                    // const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId } });
                    const modRoles = await getRoles(ctx, serverId);
                    const userModRoles = modRoles.filter((modRole) => member.roleIds.includes(modRole.roleId));
                    const requiredValue = roleValues[command.requiredRole];

                    // check if the user has any of the roles of this required type
                    if (!userModRoles.some((role) => roleValues[role.type] >= requiredValue)) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_INVALID_USER_PERMISSIONS",
                            user_id: message.createdBy,
                            event_properties: { serverId: message.serverId },
                        });

                        return ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing the ${inlineCode(command.requiredRole)} role!`);
                    }
                    // if this command is operator only, then silently ignore because of privacy reasons
                } else if (command.devOnly) return void 0;
            }

            return executeCommand(packet, ctx, server, member, command, args);
        },
        tryExecuteCommand: async (packet: MessagePayload, ctx: TClient, server: TServer, member: TeamMemberPayload, command: TCommand, args: Record<string, any>) => {
            const { message } = packet.d;

            try {
                void ctx.amp.logEvent({ event_type: "COMMAND_RAN", user_id: message.createdBy, event_properties: { serverId: message.serverId!, command: command.name } });

                // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
                // and the command context (raw packet, database server entry, member from API or cache)
                await command.execute(message, args, ctx, { packet, server, member });
            } catch (e) {
                // ID for error, not persisted in database at all
                const referenceId = 10; // nanoid();
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
