import Embed from "@guildedjs/embeds";
import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type { CommandArgument } from "../commands/Command";
import { argumentDictionary } from "../commands/commandUtil";
import type { Context } from "../typings";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || message.createdBy === ctx.userId || !message.serverId) return void 0;

    const serverFromDb = await ctx.serverUtil.getServer(message.serverId);
    if (serverFromDb?.blacklisted || !serverFromDb?.flags?.includes("EARLY_ACCESS")) return void 0;

    const prefix = serverFromDb.prefix ?? process.env.DEFAULT_PREFIX;

    if (!message.content.startsWith(prefix)) {
        await ctx.messageUtil.logMessage(message);
        return ctx.contentFilterUtil.scanMessage(message, serverFromDb);
    }

    let [commandName, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
    if (!commandName) return void 0;
    commandName = commandName.toLowerCase();

    let command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
    if (!command) return;

    const parentCommand = command;
    if (command.parentCommand && command.subCommands?.size) {
        if (!args[0])
            return ctx.messageUtil.send(message.channelId, {
                content: "Invalid command usage",
                embeds: [
                    new Embed({
                        title: `:x: No sub-command specified`,
                        description: `Please provide a sub-command.`,
                        color: ctx.messageUtil.colors.dull,
                        fields: [
                            {
                                name: "Available sub-commands",
                                value: `- ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join("\n- ")}`,
                                inline: true,
                            },
                            {
                                name: "Example",
                                value: stripIndents`
                                        ${serverFromDb.prefix ?? process.env.DEFAULT_PREFIX}${commandName} ${command.subCommands.firstKey()}
                                    `,
                                inline: true,
                            },
                        ],
                    }),
                ],
            });
        const subCommand = command.subCommands.get(args[0]);
        if (!subCommand)
            return ctx.messageUtil.send(message.channelId, {
                content: "Invalid command usage",
                embeds: [
                    new Embed({
                        title: `:x: Sub-command not found`,
                        description: `The specified sub-command could not be found.`,
                        color: ctx.messageUtil.colors.dull,
                        fields: [
                            {
                                name: "Available sub-commands",
                                value: `- ${command.subCommands.map((x) => `\`${x.name.split("-")[1]}\``).join("\n- ")}`,
                                inline: true,
                            },
                            {
                                name: "Example",
                                value: stripIndents`
                                        ${serverFromDb.prefix ?? process.env.DEFAULT_PREFIX}${commandName} ${command.subCommands.firstKey()}
                                    `,
                                inline: true,
                            },
                        ],
                    }),
                ],
            });
        command = subCommand;
        args = args.slice(1);
    }

    function handleIncorrectArg(commandArg: CommandArgument): void {
        if (!command) return;

        void ctx.messageUtil.send(message.channelId, {
            content: "Incorrect command usage",
            embeds: [
                new Embed({
                    title: ":x: Incorrect argument",
                    description: `Sorry, but the usage of argument \`${commandArg.name}\` was not correct. Was expecting a ${argumentDictionary[commandArg.type].friendlyName}.`,
                    color: ctx.messageUtil.colors.bad,
                    fields: [
                        {
                            name: "Usage",
                            value: stripIndents`
                                \`\`\`clojure
                                ${prefix}${parentCommand.name}${command.name === parentCommand.name ? "" : ` ${command.subName ?? command.name}`} ${command.usage}
                                \`\`\`
                            `,
                        },
                    ],
                }),
            ],
        });
    }

    const resolvedArgs: Record<string, string | string[] | number | boolean | null> = {};
    if (command.args && command.args.length) {
        for (let i = 0; i < command.args.length; i++) {
            const commandArg = command.args[i];

            // Optional check
            if (commandArg.type !== "listRest" && commandArg.optional && typeof args[i] == "undefined") continue;

            const handler = argumentDictionary[commandArg.type];

            const preTransformed = handler.preTransform?.(args, i) ?? args[i];
            if (!handler.isCorrect(args, i, preTransformed)) return handleIncorrectArg(commandArg);

            resolvedArgs[commandArg.name] = handler.transform?.(args, i, preTransformed, commandArg) ?? preTransformed;
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
