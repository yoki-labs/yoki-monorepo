import type { AbstractClient } from "../Client";

export abstract class Util<T extends AbstractClient<any, any, any>> {
    constructor(public readonly client: T) {}

    get roleUtil() {
        return this.client.roleUtil;
    }

    get messageUtil() {
        return this.client.messageUtil;
    }
}
