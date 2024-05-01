export interface IServer {
    prefix: string | null;
}
export interface IServerFlagged<T extends string> extends IServer {
    prefix: string | null;
    premium?: T | null;
    flags: string[];
}
export interface IRole<T extends string> {
    serverId: string;
    roleId: number;
    type: T;
}
