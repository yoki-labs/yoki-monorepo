import type { ChannelIgnoreType } from "@prisma/client";

export const ChannelIgnoreTypeMap: Record<string, ChannelIgnoreType> = {
    URL: "URL",
    LINK: "URL",
    INVITE: "INVITE",
    AUTOMOD: "AUTOMOD",
    WORD: "AUTOMOD",
    PHRASE: "AUTOMOD",
};
export enum ChannelIgnoreSettingAction {
    REMOVE = "REMOVE",
}
