import type Client from "../Client";

export class Util {
    readonly prisma = this.client.prisma;
    readonly rest = this.client.rest;
    readonly dbUtil = this.client.dbUtil;
    constructor(public readonly client: Client) {}
}
