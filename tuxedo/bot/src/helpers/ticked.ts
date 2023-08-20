import { Util } from "@yokilabs/bot";

import { TuxoClient } from "../Client";

export abstract class TickedUtil extends Util<TuxoClient> {
    private _tickIntervals: NodeJS.Timer[] = [];

    /**
     * Adds a new ticking utility function.
     * @param fn The function to tick
     * @param msPerTick When to tick in milliseconds
     * @returns The index of the added interval
     */
    protected addTicked(fn: () => unknown | Promise<unknown>, msPerTick: number) {
        return this._tickIntervals.push(setInterval(fn, msPerTick));
    }

    /**
     * Removes a ticking function specified by its index.
     * @param index The index of the ticking function to remove
     */
    protected removeTicked(index: number) {
        const ticked = this._tickIntervals[index];

        if (ticked) return clearInterval(ticked);
    }

    /**
     * Starts ticking the utility type.
     * @returns Itself
     */
    public abstract tick(): this;
}
