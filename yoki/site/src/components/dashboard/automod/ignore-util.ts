import { faBarsStaggered, faCheckSquare, faEnvelope, faHashtag, faImage, faLink, faMessage, faRectangleList, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { ChannelIgnoreType, ContentIgnoreType } from "@prisma/client";

import { LabsFormFieldOption } from "../../form/form";

export const channelIgnoreTypeList: LabsFormFieldOption<ChannelIgnoreType>[] = [
    { name: "Automod", value: ChannelIgnoreType.AUTOMOD, icon: faShieldHalved },
    { name: "Invite", value: ChannelIgnoreType.INVITE, icon: faEnvelope },
    { name: "URL", value: ChannelIgnoreType.URL, icon: faLink },
    { name: "NSFW", value: ChannelIgnoreType.NSFW, icon: faImage },
];

export const contentIgnoreSelectionList: LabsFormFieldOption<ContentIgnoreType>[] = [
    {
        value: ContentIgnoreType.MESSAGE,
        name: "Messages",
        icon: faHashtag,
    },
    {
        value: ContentIgnoreType.THREAD,
        name: "Threads",
        icon: faBarsStaggered,
    },
    {
        value: ContentIgnoreType.FORUM_TOPIC,
        name: "Forum Topics",
        icon: faRectangleList,
    },
    {
        value: ContentIgnoreType.COMMENT,
        name: "Comments",
        icon: faMessage,
    },
    {
        value: ContentIgnoreType.LIST_ITEM,
        name: "List Items",
        icon: faCheckSquare,
    },
];
