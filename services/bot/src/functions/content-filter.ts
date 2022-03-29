import { ContentFilter, PrismaClient, Severity } from "@prisma/client";

export const options = {
    kick: Severity.KICK,
    ban: Severity.BAN,
    mute: Severity.MUTE,
    softban: Severity.SOFTBAN,
    warn: Severity.WARN,
} as const;
export const optionKeys = Object.keys(options);
export const transformSeverityStringToEnum = (str: string) => options[str] as Severity;

export const addWordToFilter = (prisma: PrismaClient, data: Omit<ContentFilter, "id">) => prisma.contentFilter.create({ data });
export const removeWordFromFilter = (prisma: PrismaClient, serverId: string, content: string) =>
    prisma.contentFilter.deleteMany({ where: { serverId, content } });
