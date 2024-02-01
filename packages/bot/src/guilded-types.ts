import { RichMarkupValue } from "./utils/rich-types";

export type Permission =
    | "CanReadChats"
    | "CanReadEvents"
    | "CanReadForums"
    | "CanReadDocs"
    | "CanReadMedia"
    | "CanListenVoice"
    | "CanReadListItems"
    | "CanReadSchedules"
    | "CanReadStreams"
    | "CanReadAnnouncements";

interface ChannelPermission {
    channelId: string;
    permissions: Partial<Record<Permission, boolean>>;
    createdAt: string;
    updatedAt?: string | null;
}

export interface ChannelRolePermission extends ChannelPermission {
    roleId: number;
}

export interface ChannelUserPermission extends ChannelPermission {
    userId: string;
}

export interface GuildedClientUserProfile {
    id: string;
    name: string;
    type: "user";

    userStatus: {
        customReactionId: number;
        customReaction: { id: number; name: string; png: string | null; webp: string | null; apng: string | null; teamId: string | null; };
        content: RichMarkupValue;
    };

    profilePictureSm: string;
    profilePicture: string;
    profilePictureLg: string;
    profilePictureBlur: string;

    profileBannerSm: string;
    profileBanner: string;
    profileBannerLg: string;
    profileBannerBlur: string;

    createdAt: string;
}
