import type AbstractClient from "../Client";

export default abstract class Util<T extends AbstractClient<any, any, any>> {
    // readonly prisma = this.client.prisma;
    readonly rest = this.client.rest;
    constructor(public readonly client: T) {}
}
