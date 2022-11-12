import type AbstractClient from "../Client";

export abstract class Util<T extends AbstractClient<any, any, any>> {
    // readonly prisma = this.client.prisma;
    readonly rest = this.client.rest;
    constructor(public readonly client: T) {}
}
