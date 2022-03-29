import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";

import { createFreshServerInDatabase, getServerFromDatabase, logMessage } from "../functions";
import { Context } from "../typings";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || !message.serverId || !message.content.startsWith(process.env.DEFAULT_PREFIX)) return void 0;
    let [commandName, ...args] = message.content.slice(process.env.DEFAULT_PREFIX.length).trim().split(/ +/g);
    if (!commandName) return void 0;
    commandName = commandName.toLowerCase();

    let command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
    const serverFromDb = await getServerFromDatabase(ctx.prisma, message.serverId);
    if (serverFromDb?.disabled) return void 0;
    if (!serverFromDb) await createFreshServerInDatabase(ctx.prisma, message.serverId);
    if (!command) return logMessage(ctx.prisma, message);
    if (command.parentCommand) {
        if (!args[0])
            return ctx.rest.router.createChannelMessage(
                message.channelId,
                `You must provide a sub command to run. Your options are: ${command.subCommands.map((x) => `\`${x.name}\``).join(", ")}`
            );
        const subCommand = command.subCommands.get(args[0]);
        if (!subCommand) return ctx.rest.router.createChannelMessage(message.channelId, "Invalid sub-command");
        command = subCommand;
        args = args.slice(1);
    }

    const resolvedArgs: Record<string, string | number | boolean> = {};
    if (command.args && command.args.length) {
        for (let i = 0; i < command.args.length; i++) {
            if (command.args[i].type === "string" && typeof args[i] !== "string")
                return ctx.rest.router.createChannelMessage(
                    message.channelId,
                    `Sorry, your arg was not valid! Was expecting a string, received ${args[i]}`
                );
            resolvedArgs[command.args[i].name] = args[i];
        }
    }

    try {
        await command.execute(message, resolvedArgs, { packet }, ctx);
    } catch (e) {
        console.error(e);
        return ctx.rest.router.createChannelMessage(
            message.channelId,
            stripIndents`
        **Oh no, something went wrong!**
        This is potentially an issue on our end, please contact us and include the following:
        \`${(e as Error).message}\`
        `
        );
    }

    return void 0;
};
