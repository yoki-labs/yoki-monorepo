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
