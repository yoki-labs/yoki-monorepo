import { Action, ContentFilter, LogChannel, Preset, Role, Server, UrlFilter } from "@prisma/client";

export type SanitizedServer = Omit<Server, "id" | "flags" | "blacklisted" | "botJoinedAt" | "createdAt" | "updatedAt"> & { earlyaccess: boolean; };

export type SanitizedLogChannel = Pick<LogChannel, "serverId" | "channelId" | "type"> & { createdAt: string; };

export type SanitizedAction = Omit<Action, "logChannelId" | "logChannelMessage" | "createdAt" | "updatedAt" | "expiresAt"> & { createdAt: string; updatedAt: string | null, expiresAt: string | null; };

export type SanitizedRole = Omit<Role, "id"> & { createdAt: string; };

export type SanitizedPreset = Omit<Preset, "id">;

export type SanitizedContentFilter = ContentFilter;
export type SanitizedUrlFilter = UrlFilter;