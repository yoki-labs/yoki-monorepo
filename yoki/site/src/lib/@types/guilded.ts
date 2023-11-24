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

export interface GuildedClientChannel {
    id: string;
    contentType: "chat" | "stream" | "voice" | "forum" | "media";
    // Display
    name: string;
    description: string | null;
    // Place
    priority: number | null;
    teamId: string;
    groupId: string;
    channelCategoryId: number;
    // States
    isPublic: boolean;
    isRoleSynced: boolean;
    // By
    createdBy: string;
    createdByWebhookId: string | null;
    archivedByWebhookId: string | null;
    // Dates
    addedAt: string;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
    deletedAt: string | null;
}

export interface GuildedUserDetail {
    id: string;
    name: string;
    nickname?: string;
    subdomain: string;
    profilePicture: string | null;
    aboutInfo?: { tagLine?: string };
    joinDate?: string;
    lastOnline: string;
    teamXp?: number;
    stonks: number;
    flairInfos?: Array<{
        flair: "gil_gang" | "custom";
        customFlairInfo: null | { iconUrl: string; name: string; id: number; };
        amount: number;
    }>;
    socialLinks?: Array<{
        handle: string;
        serviceId: string;
        type: "twitter";
    }>;
    membershipRole: "member" | "formerMember";
    type?: "bot";
}
export type GuildedSanitizedUserDetail = Pick<GuildedUserDetail, "id" | "name" | "nickname" | "subdomain" | "profilePicture" | "aboutInfo" | "type">;

export type GuildedSanitizedChannel = Pick<GuildedClientChannel, "id" | "contentType" | "name" | "description" | "priority" | "groupId" | "isPublic" | "createdBy">;

export type GuildedServer = Pick<Server, "id" | "name" | "avatar" | "banner" | "url"> | Server;
