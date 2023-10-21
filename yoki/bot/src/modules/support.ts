import { LogChannelType, ModmailThread, ReactionActionType } from "@prisma/client";
import { inlineCode, Util } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { nanoid } from "nanoid";

import type YokiClient from "../Client";
import type { LogChannel, Server } from "../typings";
import { errorLoggerS3, uploadS3 } from "../utils/s3";

export default class SupportUtil extends Util<YokiClient> {
    async createModmailThread(server: Server, channelId: string, createdBy: string) {
        const { serverId } = server;

        if (!server.modmailPingRoleId) return;

        // User needs to close the other thread before proceeding with a new one
        // Notify the user why thread cannot be created
        const userAlreadyHasChannel = await this.client.prisma.modmailThread.findFirst({ where: { openerId: createdBy, serverId, closed: false } });
        if (userAlreadyHasChannel)
            return this.client.messageUtil.sendWarningBlock(
                channelId,
                `Close existing thread`,
                `<@${createdBy}>, a new ticket could not be created, as you have a pending ticket already.`,
                undefined,
                {
                    isPrivate: true,
                }
            );

        void this.client.amp.logEvent({ event_type: "MODMAIL_THREAD_CREATE", user_id: createdBy, event_properties: { serverId } });

        const member = await this.client.members.fetch(serverId, createdBy, true);

        // Weird bug? Ignore the creation
        if (!member) return;

        const modmailThreadId = nanoid(13);
        const threadCreatedAt = new Date();

        const modmailMessage = await this.messageUtil
            .sendInfoBlock(
                channelId,
                `New modmail ticket`,
                `<@${server.modmailPingRoleId}>, a new modmail ticket has been created by <@${createdBy}> (${inlineCode(createdBy)}).`,
                {
                    fields: [
                        {
                            name: "Additional info",
                            value: stripIndents`
                            **Ticket ID:** ${inlineCode(modmailThreadId)}
                            **Created at:** ${server.formatTimezone(threadCreatedAt)}
                        `,
                        },
                    ],
                },
                {
                    isPrivate: true,
                }
            )
            .catch((err) => {
                void errorLoggerS3(this.client, "MODMAIL_THREAD_CREATE", err as Error, { serverId, createdBy });
                return null;
            });

        // If messages can't be created, just don't create the modmail thread
        if (!modmailMessage) return;

        const thread = await this.client.channels
            .create({
                serverId,
                parentId: channelId,
                messageId: modmailMessage.id,
                type: "chat",
                name: `${member.user!.name.slice(0, 12)} - ${createdBy}`,
            })
            .catch((err) => {
                void errorLoggerS3(this.client, "MODMAIL_THREAD_CREATE", err as Error, { serverId, createdBy });
                return null;
            });

        // Can't do anything else; they might be doing custom modmail? In that case, don't do anything in the DB
        // Could delete the message, but that would create silent pings
        if (!thread) return;

        return this.client.prisma.modmailThread.create({
            data: {
                id: nanoid(13),
                modFacingChannelId: thread.id,
                userFacingChannelId: thread.id,
                serverId,
                handlingModerators: [],
                openerId: createdBy,
                createdAt: threadCreatedAt,
            },
        });
    }

    async closeThreadIfExists(server: Server, channelId: string) {
        const { serverId } = server;

        const ticket = await this.client.prisma.modmailThread.findFirst({
            where: {
                serverId,
                modFacingChannelId: channelId,
                closed: false,
            },
        });

        // Nothing to close
        if (!ticket) return;

        await this.client.prisma.modmailThread.update({
            where: {
                id: ticket.id,
            },
            data: {
                closed: true,
            },
        });

        void this.client.amp.logEvent({
            event_type: "MODMAIL_CLOSE",
            user_id: this.client.user!.id,
            event_properties: { server: server.serverId, threadAge: Date.now() - ticket.createdAt.getTime() },
        });

        return this.sendModmailCloseMessage(server, ticket, "automatically closed due to thread archival or deletion");
    }

    async closeExistingThread(server: Server, ticket: ModmailThread, closedBy: string) {
        // Since they are sort of contributing to it
        const handlingModerators = ticket.handlingModerators.includes(closedBy) ? ticket.handlingModerators : ticket.handlingModerators.concat(closedBy);

        await this.client.prisma.modmailThread.update({
            where: {
                id: ticket.id,
            },
            data: {
                closed: true,
                handlingModerators,
            },
        });

        void this.client.amp.logEvent({
            event_type: "MODMAIL_CLOSE",
            user_id: this.client.user!.id,
            event_properties: { server: server.serverId, threadAge: Date.now() - ticket.createdAt.getTime() },
        });
    }

    async sendModmailCloseMessage(server: Server, ticket: ModmailThread, closedState: string) {
        const { serverId } = server;

        const modmailReaction = await this.client.prisma.reactionAction.findFirst({
            where: { serverId, actionType: ReactionActionType.MODMAIL },
        });
        const modmailLogChannel = await this.client.dbUtil.getLogChannel(serverId, LogChannelType.modmail_logs);

        // Nowhere to send anything
        if (!(modmailReaction?.channelId || modmailLogChannel)) return;

        const historyMessage = await this.createModmailHistory(server, ticket);

        // Send notification and logs to the person who opened it
        if (modmailReaction?.channelId)
            await this.client.messageUtil.sendInfoBlock(
                modmailReaction.channelId,
                `Ticket closed`,
                `<@${ticket.openerId}>, your thread has been ${closedState}.`,
                {
                    fields: [
                        {
                            name: "Message history",
                            value: historyMessage,
                        },
                    ],
                },
                { isPrivate: true }
            );

        // Send it as a log to the staff
        if (modmailLogChannel) await this.sendModmailLog(serverId, ticket, modmailLogChannel, closedState, historyMessage);
    }

    async sendModmailLog(serverId: string, ticket: ModmailThread, modmailLogChannel: LogChannel, closedState: string, historyMessage: string) {
        return this.client.messageUtil.sendLog({
            where: modmailLogChannel.channelId,
            serverId,
            title: `Ticket closed`,
            description: `Thread \`#${ticket.id}\` created by <@${ticket.openerId}> has been ${closedState}.`,
            color: Colors.blockBackground,
            occurred: new Date().toISOString(),
            fields: [
                {
                    name: `Message history`,
                    value: historyMessage,
                },
            ],
        });
    }

    async createModmailHistory(server: Server, ticket: ModmailThread) {
        const modmailMessages = await this.client.prisma.modmailMessage.findMany({
            where: { modmailThreadId: ticket.id },
        });

        const formattedMessages = modmailMessages.map((x) => `[${x.authorId}][${server.formatTimezone(x.createdAt)}] ${x.content}`);
        const uploadedLog = await uploadS3(
            this.client,
            `modmail/logs/${ticket.serverId}-${ticket.id}.txt`,
            `
                -------------
                Opener: ${ticket.openerId}
                Server: ${ticket.serverId}
                Created At: ${server.formatTimezone(ticket.createdAt)}
                -------------

                ${formattedMessages.join("\n")}
            `
        ).catch((e) => (console.error("Error while uploading log:\n", e), { Location: "https://guilded.gg/" }));

        // Since we are going to send it to both user and in the mod logs
        return stripIndents`
                \`\`\`md
                ${formattedMessages
                    .slice(0, 2)
                    .map((x) => (x.length > 400 ? `${x.slice(0, 400)}...` : x))
                    .join("\n")}
                ${formattedMessages.length > 2 ? "..." : ""}
                \`\`\`

                [Click here to view more](${uploadedLog.Location})
            `;
    }
}
