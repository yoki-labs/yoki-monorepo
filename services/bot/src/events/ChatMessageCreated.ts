import Embed from "@guildedjs/embeds";
import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { CommandArgument } from "../commands/Command";
import type { Context } from "../typings";
import { isUUID } from "../util";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    const serverFromDb = await ctx.serverUtil.getServerFromDatabase(message.serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    if (!message.content.startsWith(serverFromDb.prefix ?? process.env.DEFAULT_PREFIX)) {
        await ctx.messageUtil.logMessage(message);
        return ctx.contentFilterUtil.scanMessage(message, serverFromDb);
    }

    let [commandName, ...args] = message.content.slice(process.env.DEFAULT_PREFIX.length).trim().split(/ +/g);
    if (!commandName) return void 0;
    commandName = commandName.toLowerCase();

    let command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
    if (!command) return;

    const parentCommand = command;
    if (command.parentCommand && command.subCommands?.size) {
        if (!args[0])
            return ctx.messageUtil.send(
                message.channelId,
                `You must provide a sub command to run. Your options are: ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join(", ")}. Example: \`${
                    serverFromDb.prefix ?? process.env.DEFAULT_PREFIX
                }${command.name}\``
            );
        const subCommand = command.subCommands.get(args[0]);
        if (!subCommand)
            return ctx.messageUtil.send(
                message.channelId,
                `Invalid sub-command. Your options are ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join(", ")}. Example: \`${
                    serverFromDb.prefix ?? process.env.DEFAULT_PREFIX
                }${command.name} ${command.subCommands.first()!.subName}\``
            );
        command = subCommand;
        args = args.slice(1);
    }

    function handleIncorrectArg(i: number, commandArg: CommandArgument): void {
        if (!command) return;

        void ctx.messageUtil.send(
            message.channelId,
            stripIndents`
                Sorry, your ${commandArg.name} was not valid! Was expecting a \`string\`, received \`${typeof args[i] === "undefined" ? "nothing" : args[i]}\`
                **Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\``
        );
    }

    const resolvedArgs: Record<string, string | string[] | number | boolean | null> = {};
    if (command.args && command.args.length) {
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];

            // Optional check
            if (commandArg.optional && typeof args[i] == "undefined") continue;

            switch (commandArg.type) {
                case "rest": {
                    const restArgs = args.slice(i);
                    if (restArgs.length <= 0) return handleIncorrectArg(i, commandArg);

                    resolvedArgs[commandArg.name] = restArgs.join(" ") ?? null;
                    break;
                }
                case "listRest": {
                    const restArgs = args.slice(i);
                    if (restArgs.length <= 0) return handleIncorrectArg(i, commandArg);

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
                    if (typeof args[i] !== "string") return handleIncorrectArg(i, commandArg);

                    resolvedArgs[commandArg.name] = args[i] ?? null;
                    break;
                }
                case "number": {
                    if (Number.isNaN(Number(args[i]))) return handleIncorrectArg(i, commandArg);

                    resolvedArgs[commandArg.name] = args[i] ? Number(args[i]) : null;
                    break;
                }
                case "boolean": {
                    if (!["true", "enable", "yes", "disable", "false", "no"].includes(args[i]?.toLowerCase())) return handleIncorrectArg(i, commandArg);

                    resolvedArgs[commandArg.name] = ["true", "yes", "enable"].includes(args[i]?.toLowerCase());
                    break;
                }
                case "UUID": {
                    if (!isUUID(args[i])) return handleIncorrectArg(i, commandArg);

                    resolvedArgs[commandArg.name] = args[i];
                    break;
                }
                default:
                    resolvedArgs[commandArg.name] = args[i];
            }
        }
    }

    const member = await ctx.serverUtil.getMember(message.serverId, message.createdBy);

    if (!ctx.operators.includes(message.createdBy))
        if (command.requiredRole) {
            const modRoles = await ctx.prisma.role.findMany({ where: { serverId: message.serverId, type: command.requiredRole } });
            if (!modRoles.some((role) => member.roleIds.includes(role.roleId)))
                return ctx.messageUtil.reply(message, `Oh no! Unfortunately, you are missing the ${command.requiredRole} role permission!`);
        } else if (command.ownerOnly) return void 0;

    try {
        await command.execute(message, resolvedArgs, ctx, { packet, server: serverFromDb, member });
    } catch (e) {
        const referenceId = nanoid();
        if (e instanceof Error) {
            console.error(e);
            Error.captureStackTrace(e);
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
						${e.stack}
						\`\`\`
					`
                    )
                    .setColor("RED"),
            ]);
        }
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
