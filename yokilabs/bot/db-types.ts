export interface IServer {
    prefix?: string;
}
export interface IRole<T extends string> {
    serverId: string;
    roleId: number;
    type: T;
}
