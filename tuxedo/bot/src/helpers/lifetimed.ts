import { Currency } from "@prisma/client";

import { TickedUtil } from "./ticked";

const evaporateInstancesIn = 20 * 60 * 1000;
const instanceLifetimeTick = evaporateInstancesIn;

export interface CurrencyEmoteAwait {
    currency: Currency;
    serverId: string;
    channelId: string;
    messageId: string;
    createdAt: number;
}

export class LifetimedUtil extends TickedUtil {
    awaitingCurrencyEmotes: CurrencyEmoteAwait[] = [];

    tick() {
        console.log("Will start ticking minigames, currency emote awaits");
        this.addTicked(this.handleInstanceLifetimes.bind(this), instanceLifetimeTick);

        return this;
    }

    handleInstanceLifetimes() {
        const currentTime = Date.now();

        // To have index saved and all
        for (let i = 0; i < this.client.minigameUtil.blackJackInstances.length; i++) {
            const blackjackInstance = this.client.minigameUtil.blackJackInstances[i];
            console.log({ blackjackInstance, i, evaporateInstancesIn, currentTime, maxLifetime: blackjackInstance.createdAt + evaporateInstancesIn });

            // It's time to make it evaporate
            if (currentTime > blackjackInstance.createdAt + evaporateInstancesIn) this.client.minigameUtil.blackJackInstances.splice(i, 1);
        }
        // Delete awaiting currencies
        for (let i = 0; i < this.awaitingCurrencyEmotes.length; i++) {
            const awaitingCurrencyEmote = this.awaitingCurrencyEmotes[i];

            if (currentTime > awaitingCurrencyEmote.createdAt + evaporateInstancesIn) this.awaitingCurrencyEmotes.splice(i, 1);
        }
    }
}
