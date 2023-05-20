import { Util } from "@yokilabs/bot";
import { TuxedoClient } from "../Client";
import { Giveaway } from "@prisma/client";

const tickIntervalMs = 10 * 60 * 1000;
const updateIntervalMs = 60 * 1000;

export class GiveawayUtil extends Util<TuxedoClient> {
    giveawayDates: Record<string, number>;
    endingGiveawayPool: Giveaway[];
    unpushedParticipants: Record<string, string[]>;

    constructor(client: TuxedoClient) {
        super(client);

        this.giveawayDates = this.unpushedParticipants = {};
        this.endingGiveawayPool = [];
    }

    async cacheGiveaways() {
        const activeGiveaways = await this.client.prisma.giveaway.findMany();

        for (let giveaway of activeGiveaways)
            this.addGiveaway(giveaway);
    }

    // Tick giveaways every 20mins and complete the completed ones. If they will end faster than 
    tickGiveaways() {
        setInterval(() => this.handleGiveaways, tickIntervalMs);
    }

    async handleGiveaways() {
        const nextTick = Date.now() + tickIntervalMs;

        // Get giveaways to cache and start actively tracking
        const newEndingGiveaways = Object.keys(this.giveawayDates).filter(x => this.giveawayDates[x] <= nextTick);

        if (newEndingGiveaways.length)
            this.endingGiveawayPool.push(...await this.client.prisma.giveaway.findMany({ where: { id: { in: newEndingGiveaways } } }));
    }

    async handleEndingGiveaways() {
        // TODO
    }

    addGiveaway(giveaway: Giveaway) {
        this.giveawayDates[giveaway.id] = giveaway.endsAt.getTime();
    }
}