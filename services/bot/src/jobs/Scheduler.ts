import type Client from "../Client";

export abstract class Scheduler<K, T> {
    public timeouts: Map<K, NodeJS.Timeout> = new Map();

    public abstract sweeper(): Promise<any>;
    public abstract sweep(input: T): Promise<any>;
    public constructor(public readonly client: Client, public readonly checkRate: number) {}
    public init() {
        void this.sweeper().then(() => {
            this.client.timeouts.set("mutes", setTimeout(this.sweeper, this.checkRate * 1000));
        });
        return this;
    }
}
