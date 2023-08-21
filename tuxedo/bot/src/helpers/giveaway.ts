import { Giveaway } from "@prisma/client";
import { errorEmbed, inlineCode } from "@yokilabs/bot";
import { Colors, formatDate, shuffleArray } from "@yokilabs/utils";
import { stripIndents } from "common-tags";
import { Embed, EmbedField } from "guilded.js";
import ms from "ms";
import { nanoid } from "nanoid";

import { TuxoClient } from "../Client";
import { TickedUtil } from "./ticked";

const tickIntervalMs = 10 * 60 * 1000;
const updateIntervalMs = 60 * 1000;
export const defaultGiveawayEmote = 90002569;

export class GiveawayUtil extends TickedUtil {
    private _longGiveaways: Record<string, { messageId: string; endsAt: number }>;
    private _endingGiveawayPool: Giveaway[];
    private _participants: Record<string, { giveawayId: string; users: string[] }>;

    // --- Initialization ---
    constructor(client: TuxoClient) {
        super(client);

        this._longGiveaways = {};
        this._participants = {};
        this._endingGiveawayPool = [];
    }

    addGiveawayParticipant(messageId: string, userId: string) {
        const participantInfo = this._participants[messageId];

        // Ignore it if it doesn't exist; probably a random reaction
        if (!participantInfo) return;

        return participantInfo.users.push(userId);
    }

    removeGiveawayParticipant(messageId: string, userId: string) {
        const participantInfo = this._participants[messageId];

        // Ignore it; probably random reaction removed
        if (!participantInfo) return;

        // Remove the user from participating
        return participantInfo.users.splice(participantInfo.users.indexOf(userId), 1);
    }

    addGiveaway(giveaway: Giveaway) {
        // To end it before the next tick if it's ending
        if (giveaway.endsAt.getTime() - Date.now() < tickIntervalMs) this._endingGiveawayPool.push(giveaway);
        else this._longGiveaways[giveaway.id] = { messageId: giveaway.messageId, endsAt: giveaway.endsAt.getTime() };

        this._participants[giveaway.messageId] = { giveawayId: giveaway.id, users: giveaway.participants };
    }

    async createGiveaway(data: Omit<Giveaway, "id" | "messageId" | "createdAt" | "participants" | "winners" | "hasEnded">, timeZone: string | undefined | null) {
        // Data for giveaway creation
        const partialData = {
            id: nanoid(17),
            createdAt: new Date(),
            participants: [],
            hasEnded: false,
            winners: [],
            ...data,
        };

        const message = await this.client.messages.send(data.channelId, {
            embeds: [this.createGiveawayEmbed(partialData, timeZone).toJSON()],
        });

        // Creating giveway stuff
        return Promise.all([
            this.client.reactions.create(message.channelId, message.id, defaultGiveawayEmote),
            this.client.prisma.giveaway
                .create({
                    data: { messageId: message.id, ...partialData },
                })
                .then(this.addGiveaway.bind(this)),
        ]);
    }

    removeGiveaway(giveawayId: string, messageId?: string) {
        const message = messageId ?? this._longGiveaways[giveawayId].messageId;

        delete this._longGiveaways[giveawayId];
        this._endingGiveawayPool.splice(
            this._endingGiveawayPool.findIndex((x) => x.id === giveawayId),
            1
        );
        delete this._participants[message];

        return this;
    }

    async cacheGiveaways() {
        // Find non-expired giveaways
        const activeGiveaways = await this.client.prisma.giveaway.findMany({ where: { hasEnded: false } });

        for (const giveaway of activeGiveaways) this.addGiveaway(giveaway);

        return this;
    }

    // --- Handling ---
    // Tick giveaways every 20mins and complete the completed ones. If they will end faster than
    tick() {
        console.log("Will start ticking giveaways");
        this.addTicked(this.handleGiveaways.bind(this), tickIntervalMs);
        this.addTicked(this.handleEndingGiveaways.bind(this), updateIntervalMs);

        return this;
    }

    async handleGiveaways() {
        const nextTick = Date.now() + tickIntervalMs;

        // Get ending giveaways to cache and start actively tracking them
        const newEndingGiveaways = Object.keys(this._longGiveaways).filter((x) => this._longGiveaways[x].endsAt <= nextTick);

        if (newEndingGiveaways.length) {
            this._endingGiveawayPool.push(...(await this.client.prisma.giveaway.findMany({ where: { id: { in: newEndingGiveaways } } })));

            // Since we pulled, it will be handled separately
            for (const endingGiveawayId of newEndingGiveaways) delete this._longGiveaways[endingGiveawayId];
        }

        // Save all the users who participated in the giveaway into DB; we don't want to do that each time user joins giveaway
        await Promise.allSettled(
            Object.values(this._participants).map(({ giveawayId, users }) =>
                this.client.prisma.giveaway.update({
                    where: {
                        id: giveawayId,
                    },
                    data: {
                        participants: users,
                    },
                })
            )
        );
    }

    async handleEndingGiveaways() {
        const now = Date.now();

        for (const giveaway of this._endingGiveawayPool)
            try {
                // const { channelId, messageId } = giveaway;

                // End it
                if (giveaway.endsAt.getTime() <= now) await this.concludeGiveaway(giveaway);
                // else await this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway));
            } catch (e) {
                console.error("Error", e);
                await this.client.errorHandler.send("Error while handling ending giveaways", [errorEmbed((e as Error).toString().substring(0, 2048))]);
            }
    }

    async concludeGiveaway(giveaway: Giveaway, timeZone?: string | undefined) {
        const { channelId, messageId } = giveaway;
        const participants = this._participants[giveaway.messageId]?.users ?? giveaway.participants;
        const winners = shuffleArray(participants).slice(0, giveaway.winnerCount);

        await Promise.all([
            this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway, timeZone, true)),
            this.client.messageUtil.sendSuccessBlock(
                channelId,
                `Giveaway has concluded!`,
                winners.length ? `The giveaway has ended and winners have been picked.` : `The giveaway has ended, but it seems that no one has joined the giveaway.`,
                {
                    fields: winners.length
                        ? [
                            {
                                name: "Winners",
                                value: winners.map((x) => `<@${x}>`).join(", "),
                            },
                            {
                                name: "Reward",
                                value: giveaway.text,
                            },
                        ]
                        : undefined,
                },
                {
                    replyMessageIds: [giveaway.messageId],
                }
            ),
            this.client.prisma.giveaway.update({ where: { id: giveaway.id }, data: { participants, hasEnded: true, winners } }),
            // this.client.prisma.giveaway.delete({ where: { id: giveaway.id } }).then(() => this.removeGiveaway(giveaway.id, giveaway.messageId)),
        ]);

        this.removeGiveaway(giveaway.id, giveaway.messageId);
    }

    async cancelGiveaway(giveaway: Giveaway, timeZone?: string | null) {
        const { channelId, messageId } = giveaway;
        const participants = this._participants[giveaway.messageId]?.users ?? giveaway.participants;

        await Promise.all([
            this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway, timeZone, true, true)),
            this.client.prisma.giveaway.update({ where: { id: giveaway.id }, data: { participants, hasEnded: true, winners: [] } }),
            // this.client.prisma.giveaway.delete({ where: { id: giveaway.id } }).then(() => this.removeGiveaway(giveaway.id, giveaway.messageId)),
        ]);

        this.removeGiveaway(giveaway.id, giveaway.messageId);
    }

    createGiveawayEmbed(giveaway: Omit<Giveaway, "messageId">, timeZone?: string | null, ended = false, canceled = false): Embed {
        const endDateMessage = canceled
            ? ":x: **Has been cancelled.**"
            : ended
                ? ":white_check_mark: **Has concluded the winners.**"
                : `**Ends in:** ${formatDate(giveaway.endsAt, timeZone)} EST (${ms(giveaway.endsAt.getTime() - Date.now(), { long: true })} left)`;

        return new Embed({
            title: ended ? ":tada: Giveaway has ended!" : ":tada: Giveaway has started!",
            description: giveaway.text,
            color: canceled ? Colors.red : ended ? Colors.green : Colors.blockBackground,
            footer: {
                "text": `Giveaway ID: ${giveaway.id}`,
            },
            fields: [
                {
                    name: "Information",
                    value: stripIndents`
                        ${endDateMessage}
                    `,
                    inline: !ended,
                },
                {
                    name: "Amount of Winners",
                    value: `${inlineCode(giveaway.winnerCount)}`,
                    inline: false,
                },
                !ended && {
                    name: "How to Join",
                    value: `React with :plus1: to join the giveaway! Removing the reaction will remove you from the giveaway.`,
                    inline: true,
                },
            ].filter(Boolean) as EmbedField[],
        });
    }
}
