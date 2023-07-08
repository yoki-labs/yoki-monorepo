import { createCommandHandler } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, UserType } from "guilded.js";

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

export default {
    execute: async (args) => {
        const [message, ctx] = args;

        // if the message wasn't sent in a server, or the person was a bot then don't do anything
        if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return void 0;
        void ctx.amp.logEvent({ event_type: "MESSAGE_CREATE", user_id: message.authorId, event_properties: { serverId: message.serverId! } });

        const isModmailChannel = await ctx.prisma.modmailThread.findFirst({
            where: { serverId: message.serverId!, userFacingChannelId: message.channelId, openerId: message.authorId, closed: false },
        });

        if (isModmailChannel) {
            void ctx.amp.logEvent({ event_type: "MODMAIL_MESSAGE", user_id: message.authorId, event_properties: { serverId: message.serverId!, modmailId: isModmailChannel.id } });
            void ctx.messages.delete(message.channelId, message.id);

            const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
            if (!member) return;
            const newModmailMessage = await ctx.messages.send(
                isModmailChannel.modFacingChannelId,
                new Embed()
                    .setDescription(message.content)
                    .setAuthor(`${member.user!.name} (${member.user!.id})`, member.user!.avatar)
                    .setColor(Colors.blockBackground)
                    .setFooter("User's message")
                    .setTimestamp()
            );
            void ctx.messages.send(isModmailChannel.userFacingChannelId, {
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
                    modmailThreadId: isModmailChannel.id,
                },
            });
        }

        const server = await ctx.dbUtil.getServer(message.serverId!);
        const prefix = fetchPrefix(server);

        // if the message does not start with the prefix
        if (!message.content.startsWith(prefix)) {
            const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
            if (member?.user?.type === UserType.Bot) return;

            // store the message in the database
            await ctx.dbUtil.storeMessage(message).catch(console.log);

            await moderateContent(ctx, server, message.channelId, "MESSAGE", FilteredContent.Message, message.authorId, message.content, message.mentions, () =>
                ctx.messages.delete(message.channelId, message.id)
            );

            if (server.scanNSFW) {
                await ctx.contentFilterUtil.scanMessageMedia(message);
            }
            return;
        }

        const parsed = await parseCommand([message, ctx], prefix);
        if (!parsed) return;
        let { command, commandName, args: parsedArgs } = parsed;

        if (!command) {
            const customCommand = await ctx.prisma.customTag.findFirst({ where: { serverId: message.serverId!, name: commandName } });
            if (!customCommand) return ctx.amp.logEvent({ event_type: "INVALID_COMMAND", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
            void ctx.amp.logEvent({ event_type: "TAG_RAN", user_id: message.authorId, event_properties: { serverId: message.serverId! } });
            return ctx.messageUtil.send(message.channelId, customCommand.content);
        }

        const perms = await checkUserPermissions(fetchServerRoles, [message, ctx], command);
        if (!perms?.member) return;
        const subCommand = await fetchCommandInfo([message, ctx], prefix, command, parsedArgs);

        if (subCommand) {
            const subPerm = await checkUserPermissions(fetchServerRoles, [message, ctx], command);
            if (!subPerm?.member) return;

            command = subCommand.command;
        }

        const resolved = await resolveArguments([message, ctx], prefix, command, parsedArgs);
        if (!resolved) return;

        // If user is capable of executing the command, it will start parsing arguments
        return tryExecuteCommand([message, ctx], server, perms.member, prefix, command, resolved.resolvedArgs);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;
