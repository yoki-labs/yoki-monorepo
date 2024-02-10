import { Action, Appeal, ChannelIgnore, ContentFilter, InviteFilter, LogChannel, ModmailThread, Preset, ReactionAction, Role, Server, UrlFilter } from "@prisma/client";

export type SanitizedServer = Omit<Server, "id" | "flags" | "blacklisted" | "botJoinedAt" | "createdAt" | "updatedAt"> & { earlyaccess: boolean };

export type SanitizedLogChannel = Pick<LogChannel, "serverId" | "channelId" | "type"> & { createdAt: string };
export type SanitizedChannelIgnore = Pick<ChannelIgnore, "serverId" | "channelId" | "contentType" | "updatedAt" | "type"> & { createdAt: string; updatedAt: string | null };

export type SanitizedAction = Omit<Action, "logChannelId" | "logChannelMessage" | "createdAt" | "updatedAt" | "expiresAt"> & {
    createdAt: string;
    updatedAt: string | null;
    expiresAt: string | null;
};
export type SanitizedAppeal = Omit<Appeal, "createdAt"> & { createdAt: string };
export type SanitizedModmailThread = Omit<ModmailThread, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string | null };
export type SanitizedRole = Omit<Role, "id"> & { createdAt: string };

export type SanitizedPreset = Omit<Preset, "id">;
export type SanitizedReactionAction = Omit<ReactionAction, "id">;

export type SanitizedContentFilter = ContentFilter;
export type SanitizedUrlFilter = UrlFilter;
export type SanitizedInviteFilter = InviteFilter;
