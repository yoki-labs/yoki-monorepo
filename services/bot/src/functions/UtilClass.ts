import type Client from "../Client";

export default class UtilClass {
    readonly prisma = this.client.prisma;
    readonly rest = this.client.rest;
    constructor(public readonly client: Client) {}
}
