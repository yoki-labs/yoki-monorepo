import Embed from "@guildedjs/embeds";
import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { Context } from "../typings";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    let serverFromDb = await ctx.serverUtil.getServerFromDatabase(message.serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;
    if (!serverFromDb) serverFromDb = await ctx.serverUtil.createFreshServerInDatabase(message.serverId);

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

    const resolvedArgs: Record<string, string | number | boolean | null> = {};
    if (command.args && command.args.length) {
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];
            if (commandArg.type === "rest" && typeof args[i] !== "string") {
                if (!commandArg.optional)
                    return ctx.messageUtil.send(
                        message.channelId,
                        stripIndents`
						Sorry, your ${commandArg.name} was not valid! Was expecting a \`string\`, received \`${typeof args[i] === "undefined" ? "nothing" : args[i]}\`
						**Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\`
					`
                    );
                resolvedArgs[commandArg.name] = args.slice(i).join(" ") ?? null;
                break;
            }

            if (commandArg.type === "string" && typeof args[i] !== "string") {
                if (!commandArg.optional)
                    return ctx.messageUtil.send(
                        message.channelId,
                        stripIndents`
							Sorry, your ${commandArg.name} was not valid! Was expecting a \`string\`, received \`${typeof args[i] === "undefined" ? "nothing" : args[i]}\`
							**Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\`
						`
                    );
                resolvedArgs[commandArg.name] = args[i] ?? null;
            } else if (commandArg.type === "number") {
                if (typeof args[i] === "undefined" || Number.isNaN(Number(args[i]))) {
                    if (!commandArg.optional)
                        return ctx.messageUtil.send(
                            message.channelId,
                            stripIndents`
								Incorrect usage! \`${commandArg.name}\` was not valid! Was expecting a \`number\`, received \`${args[i]}\`
								**Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\`
							`
                        );
                }
                resolvedArgs[commandArg.name] = args[i] ? Number(args[i]) : null;
            } else if (commandArg.type === "boolean") {
                if (typeof args[i] === "undefined" || !["true", "enable", "yes", "disable", "false", "no"].includes(args[i]?.toLowerCase()))
                    if (!commandArg.optional)
                        return ctx.messageUtil.send(
                            message.channelId,
                            stripIndents`
						Incorrect usage! \`${commandArg.name}\` was not valid! Was expecting a \`true/false\`, received \`${args[i]}\`
						**Usage:** \`${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}\`
					`
                        );
                resolvedArgs[commandArg.name] = ["true", "yes", "enable"].includes(args[i]?.toLowerCase()) ? true : false;
            } else {
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
