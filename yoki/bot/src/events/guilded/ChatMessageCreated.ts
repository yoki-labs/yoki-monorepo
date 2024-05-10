import { ContentIgnoreType } from "@prisma/client";
import { createCommandHandler } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, Member, Message, UserType } from "guilded.js";
import { inspect } from "util";

import type YokiClient from "../../Client";
import type { Command } from "../../commands/commands";
import { FilteredContent } from "../../modules/content-filter";
import type { GEvent, RoleType, Server } from "../../typings";
import { moderateContent } from "../../utils/moderation";
import { errorLoggerS3 } from "../../utils/s3";
import { roleValues } from "../../utils/util";

const { fetchPrefix, parseCommand, fetchCommandInfo, resolveArguments, checkUserPermissions, tryExecuteCommand } = createCommandHandler<YokiClient, Server, Command, RoleType>(
    roleValues,
    errorLoggerS3
);

// Fetches minimod/mod/admin roles
const fetchServerRoles = (ctx: YokiClient, serverId: string) => ctx.prisma.role.findMany({ where: { serverId } });
const logCommands = async (message: Message, command: Command, args: Record<string, any>) => {
    const stringifiedArgs = inspect(args, { depth: 1 });
    await (message.client as YokiClient).commandLogHandler
        .send(`[\`${message.serverId}\`] ${message.createdById} has ran **${command.name}** with args \`${stringifiedArgs.slice(0, 1000)}\``)
        .catch(() => null);
};

export default {
    execute: async (args) => {
        const [message, ctx] = args;

        if (!message.serverId) return;

        // If any of the flowbots delete Yoki's message deletion logs, do not make it loop and make Yoki spam
        if (message.authorId === ctx.user!.id) return;
        // if the message wasn't sent in a server, or the person was a bot then don't do anything
        else if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA") return;

        void ctx.amp.logEvent({ event_type: "MESSAGE_CREATE", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

        const server = await ctx.dbUtil.getServer(message.serverId!);

        const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
        // Can't do much
        if (!member || member.user?.type === UserType.Bot) return;

        const prefix = fetchPrefix(server);

        // if the message does not start with the prefix
        if (!message.content.startsWith(prefix)) {
            // store the message in the database
            await ctx.dbUtil.storeMessage(message).catch(console.log);

            return handleNonCommandMesssage(ctx, server, member, message);
        }

        const parsed = await parseCommand([message, ctx], prefix);
        if (!parsed) return;
        let { command, commandName, args: parsedArgs } = parsed;

        if (!command) {
            // await moderateMessage(ctx, server, message, member);
            await handleNonCommandMesssage(ctx, server, member, message);

            const customCommand = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: commandName } });

            if (!customCommand) return ctx.amp.logEvent({ event_type: "INVALID_COMMAND", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

            void ctx.amp.logEvent({ event_type: "TAG_RAN", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
            return ctx.messageUtil.send(message.channelId, customCommand.content);
        }

        // // Fetch the member from either the server or the redis cache
        // const member = await ctx.members.fetch(message.serverId!, message.createdById).catch(() => null);
        // if (!member) return;

        const canExecute = await checkUserPermissions(fetchServerRoles, [message, ctx, member, prefix], command);

        // If it could be moderated and it was moderated, ignore it
        if ((!command.requiredRole || !canExecute) && (await moderateMessage(ctx, server, message, member))) return;
        // It was just unable to execute
        else if (!canExecute) return;

        const isCommandModule = `${command.module}Enabled` in server;
        const moduleEnabledStatus = isCommandModule && server[`${command.module}Enabled`];
        const commandModuleMessage =
            isCommandModule &&
            `${moduleEnabledStatus ? "" : "⚠️"} The \`${command.module}\` module is ${moduleEnabledStatus ? "enabled" : `disabled. To enable it, run \`${server.getPrefix()}module enable ${command.module}\``
            }.`;
        const subCommand = await fetchCommandInfo([message, ctx], prefix, command, parsedArgs, commandModuleMessage || undefined);

        if (subCommand) {
            const canExecuteSub = await checkUserPermissions(fetchServerRoles, [message, ctx, member, prefix], subCommand.command);
            if (!canExecuteSub) return;

            command = subCommand.command;
            parsedArgs = subCommand.args;
        }

        const resolved = await resolveArguments([message, ctx], prefix, command, parsedArgs);
        if (!resolved) return;

        // If user is capable of executing the command, it will start parsing arguments
        return tryExecuteCommand([message, ctx], server, member, prefix, command, resolved.resolvedArgs, logCommands);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;

const handleNonCommandMesssage = async (ctx: YokiClient, server: Server, member: Member, message: Message) => {
    const messageModerated = await moderateMessage(ctx, server, message, member);

    // Do not include moderated messages in the modmail logs and such
    if (messageModerated) return;

    const ticket = await ctx.prisma.modmailThread.findFirst({
        where: { serverId: message.serverId!, userFacingChannelId: message.channelId, closed: false },
    });

    // Nothing else to do with non-command message
    if (!ticket) return;

    // Old modmail threads are still allowed
    if (ticket.modFacingChannelId !== ticket.userFacingChannelId) {
        void ctx.amp.logEvent({ event_type: "MODMAIL_MESSAGE", user_id: message.authorId, event_properties: { serverId: message.serverId!, modmailId: ticket.id } });
        void ctx.messages.delete(message.channelId, message.id);

        const newModmailMessage = await ctx.messages.send(
            ticket.modFacingChannelId,
            new Embed()
                .setDescription(message.content)
                .setAuthor(`${member.user!.name} (${member.user!.id})`, member.user!.avatar)
                .setColor(Colors.blockBackground)
                .setFooter("User's message")
                .setTimestamp()
        );
        void ctx.messages.send(ticket.userFacingChannelId, {
            embeds: [
                new Embed()
                    .setDescription(
                        stripIndents`
                            <@${message.authorId}>, you said:

                            ${message.content}
                        `
                    )
                    .setAuthor("You", member.user!.avatar)
                    .setColor(Colors.blockBackground)
                    .setFooter("Your message")
                    .setTimestamp(),
            ],
            isPrivate: true,
        });
        return ctx.prisma.modmailMessage.create({
            data: {
                authorId: message.authorId,
                channelId: message.channelId,
                content: message.content,
                originalMessageId: message.id,
                sentMessageId: newModmailMessage.id,
                modmailThreadId: ticket.id,
            },
        });
    }

    // Add handling moderators
    if (message.authorId !== ticket.openerId && !ticket.handlingModerators.includes(message.authorId))
        await ctx.prisma.modmailThread.update({
            where: {
                id: ticket.id,
            },
            data: {
                handlingModerators: ticket.handlingModerators.concat(message.authorId),
            },
        });

    // The new stuff
    return ctx.prisma.modmailMessage.create({
        data: {
            authorId: message.authorId,
            channelId: message.channelId,
            content: message.content,
            originalMessageId: message.id,
            sentMessageId: message.id,
            modmailThreadId: ticket.id,
        },
    });
};

const moderateMessage = (ctx: YokiClient, server: Server, message: Message, member: Member) =>
    moderateContent({
        ctx,
        server,
        channelId: message.channelId,
        member,
        contentType: ContentIgnoreType.MESSAGE,
        filteredContent: FilteredContent.Message,
        content: message.content,
        mentions: message.mentions,
        resultingAction: () => ctx.messages.delete(message.channelId, message.id)
    });
