import { IconImages } from "@yokilabs/utils";
import { ChannelType } from "guilded.js";

export const channelTypeToGreenIcon: Record<ChannelType, string> = {
    [ChannelType.Announcements]: IconImages.announcementsGreen,
    [ChannelType.Calendar]: IconImages.calendarGreen,
    [ChannelType.Chat]: IconImages.chatGreen,
    [ChannelType.Docs]: IconImages.docsGreen,
    [ChannelType.Forums]: IconImages.forumsGreen,
    [ChannelType.List]: IconImages.listGreen,
    [ChannelType.Media]: IconImages.mediaGreen,
    [ChannelType.Scheduling]: IconImages.schedulingGreen,
    [ChannelType.Stream]: IconImages.streamGreen,
    [ChannelType.Voice]: IconImages.voiceGreen,
};

export const channelTypeToRedIcon: Record<ChannelType, string> = {
    [ChannelType.Announcements]: IconImages.announcementsRed,
    [ChannelType.Calendar]: IconImages.calendarRed,
    [ChannelType.Chat]: IconImages.chatRed,
    [ChannelType.Docs]: IconImages.docsRed,
    [ChannelType.Forums]: IconImages.forumsRed,
    [ChannelType.List]: IconImages.listRed,
    [ChannelType.Media]: IconImages.mediaRed,
    [ChannelType.Scheduling]: IconImages.schedulingRed,
    [ChannelType.Stream]: IconImages.streamRed,
    [ChannelType.Voice]: IconImages.voiceRed,
};

export const channelTypeToGreyIcon: Record<ChannelType, string> = {
    [ChannelType.Announcements]: IconImages.announcementsGrey,
    [ChannelType.Calendar]: IconImages.calendarGrey,
    [ChannelType.Chat]: IconImages.chatGrey,
    [ChannelType.Docs]: IconImages.docsGrey,
    [ChannelType.Forums]: IconImages.forumsGrey,
    [ChannelType.List]: IconImages.listGrey,
    [ChannelType.Media]: IconImages.mediaGrey,
    [ChannelType.Scheduling]: IconImages.schedulingGrey,
    [ChannelType.Stream]: IconImages.streamGrey,
    [ChannelType.Voice]: IconImages.voiceGrey,
};
