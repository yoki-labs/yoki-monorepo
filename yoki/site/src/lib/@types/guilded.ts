import { Server } from "@guildedjs/api/types/generated/router/models/Server";

export interface GuildedClientServer {
    id: string;
    name: string;
    subdomain: string;
    profilePicture: string | null;
    teamDashImage: string | null;
    gameIds: string[];
    memberCount: number;
}

export type GuildedServer = Pick<Server, "id" | "name" | "avatar" | "url"> | Server;
