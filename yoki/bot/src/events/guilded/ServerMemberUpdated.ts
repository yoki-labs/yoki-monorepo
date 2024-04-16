import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { GuildedImages } from "@yokilabs/utils/dist/src/images";
import { UserType } from "guilded.js";

import { FilteredContent } from "../../modules/content-filter";
import { GEvent, LogChannelType } from "../../typings";
import { trimHoistingSymbols } from "../../utils/moderation";

export default {
    execute: async ([event, ctx]) => {
        const { nickname, userId, oldMember, serverId } = event;

        const server = await ctx.dbUtil.getServer(serverId, false);
        if (!server) return;

        const member = await ctx.members.fetch(serverId, event.userId).catch(() => null);
        if (member?.user?.type === UserType.Bot) return;

        const name = nickname ?? oldMember?.username;

        // check if there's a log channel channel for message deletions
        const memberUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.member_updates);
        if (memberUpdateLogChannel) {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberUpdateLogChannel.channelId,
                author: {
                    icon_url: member?.user?.avatar ?? GuildedImages.defaultAvatar,
                    name: `Nickname changed \u2022 ${member?.displayName ?? "Unknown user"}`,
                },
                // title: `Member Nickname Changed`,
                serverId,
                description: `<@${userId}> (${inlineCode(userId)}) had their nickname changed in the server.`,
                color: Colors.blockBackground,
                fields: [
                    {
                        name: "Nickname changes",
                        value: `${oldMember ? (oldMember.nickname ? inlineQuote(oldMember.nickname) : "No nickname") : "Unknown nickname"} \u21D2 ${nickname ? inlineQuote(nickname) : "No nickname"
                            }`,
                    },
                ],
                // occurred: new Date().toISOString(),
            });
        }

        // If the member's nickname is updated, scan it for any harmful content
        // Since ServerMemberUpdated doesn't provide info about user itself, even `.displayName` might not exist within it
        // Of course, the member could be fetched.
        if (server.antiHoistEnabled && oldMember?.user?.type !== UserType.Bot && userId !== ctx.user?.id && name) {
            const nonHoistingName = trimHoistingSymbols(name);

            if (nonHoistingName !== name) {
                void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId } });
                return ctx.members.updateNickname(serverId, userId, nonHoistingName?.trim() || "NON-HOISTING NAME");
            }
            const member = await ctx.members.fetch(serverId, userId).catch(() => null);
            if (!member) return;

            return ctx.contentFilterUtil.scanContent({
                member,
                text: name,
                filteredContent: FilteredContent.ServerContent,
                channelId: null,
                server,
                resultingAction: () => ctx.members.resetNickname(serverId, userId),
            });
        }

        return null;
    },
    name: "memberUpdated",
} satisfies GEvent<"memberUpdated">;
