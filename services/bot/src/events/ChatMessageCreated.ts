import type { WSChatMessageCreatedPayload } from "@guildedjs/guilded-api-typings";
import { stripIndents } from "common-tags";
import { Context } from "typings";

export default async (packet: WSChatMessageCreatedPayload, ctx: Context) => {
    const { message } = packet.d;
    if (message.createdByBotId || !message.content.startsWith(process.env.DEFAULT_PREFIX)) return void 0;
    let [commandName, ...args] = message.content.slice(process.env.DEFAULT_PREFIX.length).trim().split(/ +/g);
    if (!commandName) return void 0;
    commandName = commandName.toLowerCase();

    const command = ctx.commands.get(commandName) ?? ctx.commands.find((command) => command.aliases?.includes(commandName) ?? false);
    if (!command) return void 0;

    try {
        await command.execute(message, args, ctx, packet);
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
