import type Client from "../Client";

export abstract class Scheduler<T> {
    public abstract sweeper(): Promise<any>;
    public abstract sweep(input: T): Promise<any>;
    public constructor(public readonly client: Client, public readonly checkRate: number) {}
    public init() {
        void this.sweeper().then(() => {
            this.client.timeouts.set("mutes", setTimeout(this.sweeper.bind(this), this.checkRate * 1000));
        });
        return this;
    }
}
