import type { GEvent } from "../../typings";
import ServerChannelEvent from "./ServerChannelEvent.ignore";

export default {
    execute: ([channel, _, ctx]) => ServerChannelEvent(ctx, channel),
    name: "channelUpdated",
} satisfies GEvent<"channelUpdated">;
