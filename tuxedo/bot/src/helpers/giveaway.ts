import { Colors, Util, inlineCode } from "@yokilabs/bot";
import { TuxedoClient } from "../Client";
import { Giveaway } from "@prisma/client";
import { Embed, EmbedField } from "guilded.js";
import { stripIndents } from "common-tags";
import ms from "ms";
import { nanoid } from "nanoid";
import { shuffleArray } from "@yokilabs/bot";

const tickIntervalMs = 10 * 60 * 1000;
const updateIntervalMs = 60 * 1000;
export const defaultGiveawayEmote = 90002569;

export class GiveawayUtil extends Util<TuxedoClient> {
    longGiveaways: Record<string, { messageId: string, endsAt: number }>;
    endingGiveawayPool: Giveaway[];
    participants: Record<string, { giveawayId: string, users: string[] }>;

    // --- Initialization ---
    constructor(client: TuxedoClient) {
        super(client);

        this.longGiveaways = this.participants = {};
        this.endingGiveawayPool = [];
    }

    addGiveaway(giveaway: Giveaway) {
        this.longGiveaways[giveaway.id] = { messageId: giveaway.messageId, endsAt: giveaway.endsAt.getTime() };
        this.participants[giveaway.messageId] = { giveawayId: giveaway.id, users: giveaway.participants };
    }

    async createGiveaway(data: Omit<Giveaway, "id" | "messageId" | "createdAt" | "participants">) {
        // Data for giveaway creation
        const partialData = {
            id: nanoid(17),
            createdAt: new Date(),
            participants: [],
            ...data
        };

        const message = await this.client.messages
            .send(data.channelId, {
                embeds: [
                    this.createGiveawayEmbed(partialData)
                ]
            });
        
        // Creating giveway stuff
        await Promise.all([
            this.client.reactions.create(message.channelId, message.id, defaultGiveawayEmote),
            this.client.prisma.giveaway
                .create({
                    data: { messageId: message.id, ...partialData }
                })
                .then(this.addGiveaway.bind(this))
        ]);
    }

    removeGiveaway(giveawayId: string, messageId?: string) {
        const message = messageId ?? this.longGiveaways[giveawayId].messageId;

        delete this.longGiveaways[giveawayId];
        delete this.endingGiveawayPool[giveawayId];
        delete this.participants[message];

        return this;
    }

    async cacheGiveaways() {
        const activeGiveaways = await this.client.prisma.giveaway.findMany();

        console.log("Found giveaways", activeGiveaways);
        for (const giveaway of activeGiveaways)
            this.addGiveaway(giveaway);

        return this;
    }

    // --- Handling ---
    // Tick giveaways every 20mins and complete the completed ones. If they will end faster than 
    tickGiveaways() {
        console.log("Will start ticking giveaways");
        setInterval(async () => await this.handleGiveaways(), tickIntervalMs);
        setInterval(async () => await this.handleEndingGiveaways(), updateIntervalMs);

        return this;
    }

    async handleGiveaways() {
        const nextTick = Date.now() + tickIntervalMs;

        console.log("Ticked giveaways", this.longGiveaways);
        // Get ending giveaways to cache and start actively tracking them
        const newEndingGiveaways = Object.keys(this.longGiveaways).filter(x => this.longGiveaways[x].endsAt <= nextTick);

        console.log("Ending giveaways:", newEndingGiveaways);
        if (newEndingGiveaways.length) {
            console.log("Handling ending giveaways");
            this.endingGiveawayPool.push(...await this.client.prisma.giveaway.findMany({ where: { id: { in: newEndingGiveaways } } }));

            // Since we pulled, it will be handled separately
            for (const endingGiveawayId of newEndingGiveaways)
                delete this.longGiveaways[endingGiveawayId];
        }

        await Promise.allSettled(
            Object
                .values(this.participants)
                .map(({ giveawayId, users }) =>
                    this.client.prisma.giveaway.update({
                        where: {
                            id: giveawayId
                        },
                        data: {
                            participants: users
                        }
                    })
                )
        );
    }

    async handleEndingGiveaways() {
        console.log("Ticking ending giveaways")
        const now = Date.now();

        console.log("Ending giveaways", this.endingGiveawayPool);
        for (const giveaway of this.endingGiveawayPool) try {
            const { channelId, messageId } = giveaway;

            // End it
            console.log("Is giveaway ending:", giveaway.endsAt.getTime() <= now, giveaway);

            if (giveaway.endsAt.getTime() <= now) await this.concludeGiveaway(giveaway);
            else await this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway));
        } catch(e) {
            console.error("Error", e);
        }
    }

    concludeGiveaway(giveaway: Giveaway) {
        const { channelId, messageId } = giveaway;
        const winners = shuffleArray(this.participants[giveaway.messageId].users).slice(0, giveaway.winnerCount);

        return Promise.all([
            this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway, true)),
            this.client.messageUtil.sendSuccessBlock(
                channelId,
                `Giveaway has concluded!`,
                winners.length
                ? `The giveaway has ended and winners have been picked.`
                : `The giveaway has ended, but it seems that no one has joined the giveaway.`,
                {
                    fields: winners.length ? [
                        {
                            name: "Winners",
                            value: winners.map(x => `<@${x}>`).join(", ")
                        },
                        {
                            name: "Reward",
                            value: giveaway.text
                        }
                    ] : undefined
                },
                {
                    replyMessageIds: [giveaway.messageId]
                }
            ),
            this.client.prisma.giveaway
                .delete({ where: { id: giveaway.id } })
                .then(() =>
                    this.removeGiveaway(giveaway.id, giveaway.messageId)
                )
        ]);
    }

    cancelGiveaway(giveaway: Giveaway) {
        const { channelId, messageId } = giveaway;

        return Promise.all([
            this.client.messages.update(channelId, messageId, this.createGiveawayEmbed(giveaway, true, true)),
            this.client.prisma.giveaway
                .delete({ where: { id: giveaway.id } })
                .then(() =>
                    this.removeGiveaway(giveaway.id, giveaway.messageId)
                )
        ]);
    }

    createGiveawayEmbed(giveaway: Omit<Giveaway, "messageId">, ended = false, canceled = false): Embed {
        const endDateMessage =
            canceled
            ? ":x: **Has been cancelled.**"
            : ended
            ? ":white_check_mark: **Has ended.**"
            : `**Ends in:** ${giveaway.endsAt} (${ms(giveaway.endsAt.getTime() - Date.now(), { long: true })} left)`;

        return new Embed({
            title: ":tada: Giveaway has been started!",
            description: giveaway.text,
            color: Colors.blockBackground,
            fields: [
                {
                    name: "Information",
                    value: stripIndents`
                        ${endDateMessage}
                        **Possible winner count:** ${inlineCode(giveaway.winnerCount)}
                        **Giveaway ID:** ${inlineCode(giveaway.id)}
                        **Created by:** <@${giveaway.createdBy}>
                    `,
                    inline: !ended
                },
                !ended && {
                    name: "How to Join",
                    value: `React with :plus1: to join the giveaway!`,
                    inline: true
                }
            ].filter(Boolean) as EmbedField[]
        });
    }
}