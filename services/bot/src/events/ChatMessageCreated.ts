import Embed from "@guildedjs/embeds";
import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { CommandArgument } from "../commands/Command";
import type { Context } from "../typings";
import { isUUID } from "../util";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    // if the message wasn't sent in a server, or the person was a bot then don't do anything
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    // get the server from the database
    const serverFromDb = await ctx.serverUtil.getServer(message.serverId);
    // if the server is blacklisted or isn't in the early access, don't do anything
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    // the prefix of this server, otherwise the fallback default prefix
    const prefix = serverFromDb.prefix ?? process.env.DEFAULT_PREFIX;

    // if the message does not start with the prefix
    if (!message.content.startsWith(prefix)) {
        // store the message in the database
        await ctx.messageUtil.logMessage(message);
        // scan the message for any harmful content (filter list, presets)
        return ctx.contentFilterUtil.scanMessage(message, serverFromDb);
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
        if (!args[0])
            return ctx.messageUtil.send(
                message.channelId,
                `You must provide a sub command to run. Your options are: ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join(", ")}. Example: \`${
                    serverFromDb.prefix ?? process.env.DEFAULT_PREFIX
                }${command.name}\``
            );

        // get the sub command by name
        const subCommand = command.subCommands.get(args[0]);
        // if not a valid sub command, list all the proper ones
        if (!subCommand)
            return ctx.messageUtil.send(
                message.channelId,
                `Invalid sub-command. Your options are ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join(", ")}. Example: \`${
                    serverFromDb.prefix ?? process.env.DEFAULT_PREFIX
                }${command.name} ${command.subCommands.first()!.subName}\``
            );

        // set the command to execute to the sub command
        command = subCommand;
        // remove the sub command from the list of args, as that's the command name
        args = args.slice(1);
    }

    // handle if the arg type provided is not valid
    function handleIncorrectArg(i: number, commandArg: CommandArgument): void {
        if (!command) return;
        void ctx.messageUtil.send(
            message.channelId,
            stripIndents`
                Sorry, your ${commandArg.name} was not valid! Was expecting a \`string\`, received \`${typeof args[i] === "undefined" ? "nothing" : args[i]}\`
                **Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\``
        );
    }

    // the object of casted args casted to their proper types
    const resolvedArgs: Record<string, string | string[] | number | boolean | null> = {};
    // if this command has accepts args
    if (command.args && command.args.length) {
        // go through all the specified arguments in the command
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];

            // if the argument is not a rest type, is optional, and the actual argument is undefined, continue next in the args
            if (commandArg.type !== "listRest" && commandArg.optional && typeof args[i] == "undefined") continue;

            // check command argument type for casting
            switch (commandArg.type) {
                case "rest": {
                    // get all the rest of the arguments starting from this arg to the end
                    const restArgs = args.slice(i);
                    // if there are no args, then notify the user that it's invalid
                    if (restArgs.length === 0) return handleIncorrectArg(i, commandArg);

                    // concatenate all the args into one string
                    resolvedArgs[commandArg.name] = restArgs.join(" ") ?? null;
                    break;
                }
                case "listRest": {
                    // get all the rest of the arguments starting from this arg to the end
                    const restArgs = args.slice(i);
                    // if there are no args and the argument isn't optional, then notify the user that their input is invalid
                    if (restArgs.length === 0 && !commandArg.optional) return handleIncorrectArg(i, commandArg);

                    let finalizedArray;
                    if (restArgs.length > 0) {
                        finalizedArray = commandArg.separator ? restArgs.join(" ").split(commandArg.separator) : restArgs;
                    } else {
                        finalizedArray = [];
                    }

                    resolvedArgs[commandArg.name] = finalizedArray;
                    break;
                }
                case "string": {
                    // if the argument is not a valid string (really any input other than undefined), notify the user that it's invalid
                    if (typeof args[i] !== "string") return handleIncorrectArg(i, commandArg);
                    // if optional, this will set the argument to null
                    resolvedArgs[commandArg.name] = args[i] ?? null;
                    break;
                }
                case "number": {
                    const castedNumber = Number(args[i]);
                    // if the argument is not properly castable to a number, then notify the user that their input is invalid
                    if (Number.isNaN(castedNumber)) return handleIncorrectArg(i, commandArg);
                    // if the argument is not undefined (and is a proper number), set the arg otherwise set to null cause it would be optional by then
                    resolvedArgs[commandArg.name] = args[i] ? castedNumber : null;
                    break;
                }
                case "boolean": {
                    // if not a proper "yes/no" type input, notify the user
                    if (!["true", "enable", "yes", "disable", "false", "no"].includes(args[i]?.toLowerCase())) return handleIncorrectArg(i, commandArg);
                    // if the input is a truthy value, the argument will be set to true, otherwise false.
                    resolvedArgs[commandArg.name] = ["true", "yes", "enable"].includes(args[i]?.toLowerCase());
                    break;
                }
                case "UUID": {
                    // check if the input is a proper UUID
                    if (!isUUID(args[i])) return handleIncorrectArg(i, commandArg);
                    // set the arg to the UUID
                    resolvedArgs[commandArg.name] = args[i];
                    break;
                }
                default:
                    // if the argument type does not exist, just treat it like a string
                    resolvedArgs[commandArg.name] = args[i];
            }
        }
    }

    // fetch the member from either the server or the redis cache
    const member = await ctx.serverUtil.getMember(message.serverId, message.createdBy);

    // check if this user is not an operator
    if (!ctx.operators.includes(message.createdBy)) {
        // if this command requires a user to have a specific role, then check if they have it
        if (command.requiredRole) {
            // get all the roles of the required type for this command
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, type: command.requiredRole } });
            // check if the user has any of the roles of this required type
            if (!modRoles.some((role) => member.roleIds.includes(role.roleId)))
                return ctx.messageUtil.reply(message, `Oh no! Unfortunately, you are missing the ${command.requiredRole} role permission!`);
            // if this command is operator only, then silently ignore because of privacy reasons
        } else if (command.ownerOnly) return void 0;
    }

    try {
        // run the command with the message object, the casted arguments, the global context object (datbase, rest, ws),
        // and the command context (raw packet, database server entry, member from API or cache)
        await command.execute(message, resolvedArgs, ctx, { packet, server: serverFromDb, member });
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
						Reference ID: **${referenceId}**
						Server: **${message.serverId}**
						Channel: **${message.channelId}**
						User: **${message.createdBy}**
						Content: \`${message.content}\`
						Error: \`\`\`
						${e.stack ?? e.message}
						\`\`\`
					`
                    )
                    .setColor("RED"),
            ]);
        }
        // notify the user that there was an error executing the command
        return ctx.messageUtil.send(
            message.channelId,
            stripIndents`
				**Oh no, something went wrong!**
				This is potentially an issue on our end, please contact us and forward the following ID: \`${referenceId}\`
        	`
        );
    }

    return void 0;
};
