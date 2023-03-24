import type AbstractClient from "../Client";

export default abstract class Util<T extends AbstractClient<any, any, any>> {
    constructor(public readonly client: T) { }
}
