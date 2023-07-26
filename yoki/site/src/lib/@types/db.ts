import { LogChannel, Server } from "@prisma/client";

export type SanitizedServer = Omit<Server, "id" | "flags" | "blacklisted" | "botJoinedAt" | "createdAt" | "updatedAt">;

export type SanitizedLogChannel = Pick<LogChannel, "serverId" | "channelId" | "type"> & { createdAt: string; };