import type Client from "../Client";

export abstract class Scheduler<T> {
    public abstract sweeper(): Promise<any>;
    public abstract sweep(input: T): Promise<any>;
    public constructor(public readonly client: Client, public readonly checkRate: number) {}

    public init() {
        // This will execute the sweeper once, then start the interval
        void this.sweeper().then(() => {
            setInterval(this.sweeper.bind(this), this.checkRate * 1000);
        });
        return this;
    }
}
