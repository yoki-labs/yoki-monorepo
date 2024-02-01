import { stripIndents } from "common-tags";
import { Member, Message, PermissionsError, WebhookEmbed } from "guilded.js";
import * as lexure from "lexure";
import { nanoid } from "nanoid";

// import { nanoid } from "nanoid";
import booleanArg from "../args/boolean";
import channel from "../args/channel";
import emote from "../args/emote";
import enumArg from "../args/enum";
import enumList from "../args/enumList";
import member from "../args/member";
import user from "../args/user";
import number from "../args/number";
import rest from "../args/rest";
import role from "../args/role";
import stringArg from "../args/string";
import time from "../args/time";
import UUID from "../args/UUID";
import type { AbstractClient } from "../Client";
import type { IRole, IServer } from "../db-types";
import { bold, codeBlock, inlineCode, inlineQuote } from "../utils/formatting";
import type { ResolvedArgs, UsedMentions } from "./arguments";
import type { BaseCommand, CommandArgument, CommandArgValidator } from "./command-typings";
import { CommandArgType } from "@yokilabs/utils";

export function createCommandHandler<
    TClient extends AbstractClient<TClient, TServer, TCommand>,
    TServer extends IServer,
    TCommand extends BaseCommand<TCommand, TClient, TRoleType, TServer>,
    TRoleType extends string
>(roleValues: Record<TRoleType, number>, errorLogger?: (ctx: TClient, event: string, err: Error, context?: any) => void) {
    const argumentConverters: Record<CommandArgType, CommandArgValidator<TClient>> = {
        boolean: booleanArg,
        channel,
        enum: enumArg,
        enumList,
        time,
        member,
        user,
        number,
        rest,
        string: stringArg,
        UUID,
        emote,
        role,
    };

    // Lambda incase JS detects there is no context in lambdas from the object and garbage collects the object
    return {
        fetchPrefix: (server: TServer) => {
            const prefix = server.prefix ?? process.env.DEFAULT_PREFIX!;
            return prefix;
        },
        parseCommand: (context: [Message, TClient], prefix: string) => {
            const [message, ctx] = context;

            const lexer = new lexure.Lexer(message.content).setQuotes([
                ['"', '"'],
                ["“", "”"],
                ["'", "'"],
            ]);
            const res = lexer.lexCommand((lexS) => (lexS.startsWith(prefix) ? prefix.length : null));

            if (!res) return;

            const [lexCommand, getRest] = res;

            const args = getRest().map((x) => x.value);

            const commandName = lexCommand.value.toLowerCase();

            // Get the command by the name or if it's an alias of a command
            const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);

            if (command?.rawArgs) {
                const lexer = new lexure.Lexer(message.content).setQuotes([]);
                const res = lexer.lexCommand((lexS) => (lexS.startsWith(prefix) ? prefix.length : null));
                if (!res) return;
                const [_, getRest] = res;

                return { command, commandName, args: getRest().map((x) => x.value) };
            }

            return { command, commandName, args };
        },
        fetchCommandInfo: async (context: [Message, TClient], prefix: string, command: TCommand, args: string[], module_info?: string) => {
            const [message, ctx] = context;

            while (command.parentCommand && command.subCommands?.size) {
                // If no sub command, list all the available sub commands
                if (!args[0]) {
                    void ctx.amp.logEvent({
                        event_type: "COMMAND_MISSING_SUBCOMMAND",
                        user_id: message.createdById,
                        event_properties: { serverId: message.serverId, command: command.name },
                    });

                    // Don't show operator commands to non-operators
                    if (!command.devOnly || ctx.operators.includes(message.createdById)) {
                        const fields = [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(command, prefix)];
                        if (module_info) fields.unshift({ name: "Module Status", value: module_info });

                        await ctx.messageUtil.replyWithInfo(message, `${inlineCode(command.name.split("-").join(" "))} command`, command.description, {
                            fields,
                        });
                        return;
                    }
                }
                const subCommand = command.subCommands.get(args[0]);
                // If not a valid sub command, list all the proper ones
                if (!subCommand) {
                    void ctx.amp.logEvent({
                        event_type: "COMMAND_INVALID_SUBCOMMAND",
                        user_id: message.createdById,
                        event_properties: { serverId: message.serverId, command: command.name },
                    });

                    // Don't show operator commands to non-operators
                    if (!command.devOnly || ctx.operators.includes(message.createdById)) {
                        await ctx.messageUtil.replyWithError(message, `No such sub-command`, `The specified sub-command ${inlineQuote(args[0], 100)} could not be found.`, {
                            fields: [...ctx.messageUtil.createSubCommandFields(command.subCommands), ctx.messageUtil.createExampleField(command, prefix)],
                        });
                        return;
                    }
                }
                command = subCommand!;
                // Remove the sub command from the list of args, as that's the command name
                args = args.slice(1);
            }

            return { command, args };
        },
        checkUserPermissions: async (
            getRoles: (ctx: TClient, serverId: string) => Promise<IRole<TRoleType>[]>,
            context: [Message, TClient, Member],
            command: TCommand
        ): Promise<boolean> => {
            const [message, ctx, member] = context;
            const { serverId } = message;

            if (ctx.operators.includes(message.createdById)) return true;
            if (command.devOnly) return false;
            if (!command.requiredRole) return true;
            if (member.isOwner) return true;

            // Get all the roles of the required type for this command
            // const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId } });
            const modRoles = await getRoles(ctx, serverId!);
            const userModRoles = modRoles.filter((modRole) => member.roleIds.includes(modRole.roleId));
            const requiredValue = roleValues[command.requiredRole];

            // check if the user has any of the roles of this required type
            if (userModRoles.some((role) => roleValues[role.type] >= requiredValue)) {
                return true;
            }

            void ctx.amp.logEvent({
                event_type: "COMMAND_INVALID_USER_PERMISSIONS",
                user_id: message.createdById,
                event_properties: { serverId: message.serverId },
            });

            await ctx.messageUtil.replyWithUnpermitted(message, `Unfortunately, you are missing a role that is set as ${bold(command.requiredRole)} in this server!`);
            return false;
        },
        resolveArguments: async (context: [Message, TClient], prefix: string, command: TCommand, args: string[]) => {
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

                    const [argValidator, invalidStringGenerator] = argumentConverters[commandArg.type];

                    // run the caster and see if the arg is valid
                    const castArg = args[i] ? await argValidator(args[i], args, i, message, commandArg, usedMentions, ctx) : null;

                    // If the arg is not valid, inform the user
                    if (castArg === null) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_BAD_ARGS",
                            user_id: message.createdById,
                            event_properties: { serverId: message.serverId, command: command.name, trippedArg: commandArg },
                        });
                        await ctx.messageUtil.handleBadArg(message, prefix, commandArg, command, stripIndents(invalidStringGenerator(commandArg)));
                        return;
                    } else if (isArgumentValueInvalid(commandArg, castArg)) {
                        void ctx.amp.logEvent({
                            event_type: "COMMAND_BAD_ARGS",
                            user_id: message.createdById,
                            event_properties: { serverId: message.serverId, command: command.name, trippedArg: commandArg },
                        });
                        await ctx.messageUtil.handleBadArg(message, prefix, commandArg, command, renderExpectedArgumentValue(commandArg));
                        return;
                    }

                    // Resolve correctly converted argument
                    resolvedArgs[commandArg.name] = castArg;
                }
            }

            return { resolvedArgs };
        },
        tryExecuteCommand: async (
            [message, ctx]: [Message, TClient],
            server: TServer,
            member: Member,
            prefix: string,
            command: TCommand,
            args: Record<string, any>,
            logger?: (message: Message, command: TCommand, args: Record<string, any>) => unknown
        ) => {
            try {
                void ctx.amp.logEvent({ event_type: "COMMAND_RAN", user_id: message.createdById, event_properties: { serverId: message.serverId!, command: command.name } });

                void logger?.(message, command, args);
                // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
                // and the command context (raw packet, database server entry, member from API or cache)
                await command.execute(message, args, ctx, { message, server, member, prefix });
                return;
            } catch (e) {
                // ID for error, not persisted in database at all
                const referenceId = nanoid(17);
                if (e instanceof Error) {
                    console.log("cmd err", e);

                    // send the error to the error channel
                    if (errorLogger) {
                        errorLogger?.(ctx, "COMMAND_ERROR", e, { referenceId, server: message.serverId, command: command.name, args, message });
                    } else {
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
                }
                if (e instanceof PermissionsError) {
                    if (typeof e.response.body === "object" && e.response.body.meta) {
                        const { missingPermissions } = e.response.body.meta;
                        return ctx.messageUtil.replyWithUnpermitted(
                            message,
                            `It seems like I don't have the permissions to do that! I'm missing the following permissions: \`${missingPermissions?.join(", ")}\``
                        );
                    }
                }
                // notify the user that there was an error executing the command
                return ctx.messageUtil.replyWithUnexpected(
                    message,
                    `This is potentially an issue on our end, please contact us and forward the following ID: ${inlineCode(referenceId)}.`
                );
            }
        },
    };
}

function isArgumentValueInvalid(arg: CommandArgument, value: ResolvedArgs) {
    const hasMax = typeof arg.max !== "undefined";
    const hasMin = typeof arg.min !== "undefined";

    return (hasMax && ((value! as string | string[]).length ?? value) > arg.max!) || (hasMin && ((value! as string | string[]).length ?? value) < arg.min!);
}

function renderExpectedArgumentValue(arg: CommandArgument) {
    const hasMax = typeof arg.max !== "undefined";
    const hasMin = typeof arg.min !== "undefined";

    return hasMax && hasMin ? ` between ${arg.min} and ${arg.max}` : hasMax ? ` with max ${arg.max}` : hasMin ? ` with min ${arg.min}` : "";
}
