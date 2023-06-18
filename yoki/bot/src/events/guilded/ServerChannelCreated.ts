import type { GEvent } from "../../typings";
import ServerChannelEvent from "./ServerChannelEvent.ignore";

export default {
    execute: ([channel, ctx]) => ServerChannelEvent(ctx, channel),
    name: "channelCreated",
} satisfies GEvent<"channelCreated">;
