import { Server } from "@prisma/client";

export type SanitizedServer = Omit<Server, "id" | "flags" | "blacklisted" | "botJoinedAt" | "createdAt" | "updatedAt">;
