import { Giveaway } from "@prisma/client";
import { Colors, formatDate, inlineCode, shuffleArray, Util } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { Embed, EmbedField } from "guilded.js";
import ms from "ms";
import { nanoid } from "nanoid";

import { TuxoClient } from "../Client";

const tickIntervalMs = 10 * 60 * 1000;
const updateIntervalMs = 60 * 1000;
export const defaultGiveawayEmote = 90002569;

export class GiveawayUtil extends Util<TuxoClient> {
    longGiveaways: Record<string, { messageId: string; endsAt: number }>;
    endingGiveawayPool: Giveaway[];
    participants: Record<string, { giveawayId: string; users: string[] }>;

    // --- Initialization ---
    constructor(client: TuxoClient) {
        super(client);

        this.longGiveaways = {};
        this.participants = {};
        this.endingGiveawayPool = [];
    }

    addGiveaway(giveaway: Giveaway) {
        // To end it before the next tick if it's ending
        if (giveaway.endsAt.getTime() - Date.now() < tickIntervalMs) this.endingGiveawayPool.push(giveaway);
        else this.longGiveaways[giveaway.id] = { messageId: giveaway.messageId, endsAt: giveaway.endsAt.getTime() };

        this.participants[giveaway.messageId] = { giveawayId: giveaway.id, users: giveaway.participants };
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
            embeds: [this.createGiveawayEmbed(partialData, timeZone)],
        });

        // Creating giveway stuff
        await Promise.all([
            this.client.reactions.create(message.channelId, message.id, defaultGiveawayEmote),
            this.client.prisma.giveaway
                .create({
                    data: { messageId: message.id, ...partialData },
                })
                .then(this.addGiveaway.bind(this)),
        ]);
    }

    removeGiveaway(giveawayId: string, messageId?: string) {
        const message = messageId ?? this.longGiveaways[giveawayId].messageId;

        delete this.longGiveaways[giveawayId];
        this.endingGiveawayPool.splice(
            this.endingGiveawayPool.findIndex((x) => x.id === giveawayId),
            1
        );
        delete this.participants[message];

        return this;
    }

    async cacheGiveaways() {
        // Find non-expired giveaways
        const activeGiveaways = await this.client.prisma.giveaway.findMany({ where: { hasEnded: false } });

        console.log("Found giveaways", activeGiveaways);
        for (const giveaway of activeGiveaways) this.addGiveaway(giveaway);

        return this;
    }

    // --- Handling ---
    // Tick giveaways every 20mins and complete the completed ones. If they will end faster than
    tickGiveaways() {
        console.log("Will start ticking giveaways");
        setInterval(this.handleGiveaways.bind(this), tickIntervalMs);
        setInterval(this.handleEndingGiveaways.bind(this), updateIntervalMs);

        return this;
    }

    async handleGiveaways() {
        const nextTick = Date.now() + tickIntervalMs;

        console.log("Ticked giveaways", this.longGiveaways);
        // Get ending giveaways to cache and start actively tracking them
        const newEndingGiveaways = Object.keys(this.longGiveaways).filter((x) => this.longGiveaways[x].endsAt <= nextTick);

        console.log("Ending giveaways:", newEndingGiveaways);
        if (newEndingGiveaways.length) {
            console.log("Handling ending giveaways");
            this.endingGiveawayPool.push(...(await this.client.prisma.giveaway.findMany({ where: { id: { in: newEndingGiveaways } } })));

            // Since we pulled, it will be handled separately
            for (const endingGiveawayId of newEndingGiveaways) delete this.longGiveaways[endingGiveawayId];
        }

        await Promise.allSettled(
            Object.values(this.participants).map(({ giveawayId, users }) =>
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
        console.log("Ticking ending giveaways");
        const now = Date.now();

        console.log("Ending giveaways", this.endingGiveawayPool);
        for (const giveaway of this.endingGiveawayPool)
            try {
                const { channelId, messageId } = giveaway;

                // End it
                console.log("Is giveaway ending:", giveaway.endsAt.getTime() <= now, giveaway);

                if (giveaway.endsAt.getTime() <= now) await this.concludeGiveaway(giveaway);
                else await this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway));
            } catch (e) {
                console.error("Error", e);
            }
    }

    async concludeGiveaway(giveaway: Giveaway, timeZone?: string | undefined) {
        const { channelId, messageId } = giveaway;
        const participants = this.participants[giveaway.messageId]?.users ?? giveaway.participants;
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
        const participants = this.participants[giveaway.messageId]?.users ?? giveaway.participants;

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
            fields: [
                {
                    name: "Information",
                    value: stripIndents`
                        ${endDateMessage}
                        **Possible winner count:** ${inlineCode(giveaway.winnerCount)}
                        **Giveaway ID:** ${inlineCode(giveaway.id)}
                    `,
                    inline: !ended,
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
