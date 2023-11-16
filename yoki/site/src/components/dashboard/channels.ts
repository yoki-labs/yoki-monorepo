import { IconDefinition, faBroadcastTower, faHashtag, faVolumeLow } from "@fortawesome/free-solid-svg-icons";
import { GuildedSanitizedChannel } from "../../lib/@types/guilded";

export const channelTypeToIcon: Record<"chat" | "voice" | "stream", IconDefinition> = {
    ["chat"]: faHashtag,
    ["voice"]: faVolumeLow,
    ["stream"]: faBroadcastTower,
};

export const channelsToSelectionOptions = (channels: GuildedSanitizedChannel[]) =>
    channels.map((x) => ({
        value: x.id,
        name: x.name,
        icon: channelTypeToIcon[x.contentType as "chat" | "voice" | "stream"],
    }));