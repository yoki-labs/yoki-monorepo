export interface IServer {
    prefix: string | null;
}
export interface IRole<T extends string> {
    serverId: string;
    roleId: number;
    type: T;
}
