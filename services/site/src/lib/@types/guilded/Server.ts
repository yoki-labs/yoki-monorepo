export interface GuildedServer {
    id: string;
    name: string;
    subdomain: string;
    profilePicture: string | null;
    teamDashImage: string | null;
    gameIds: string[];
    memberCount: number;
}
