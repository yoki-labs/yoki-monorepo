import { inlineCode, inlineQuote } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";
import { UserType } from "guilded.js";

import { FilteredContent } from "../../modules/content-filter";
import { GEvent, LogChannelType } from "../../typings";
import { trimHoistingSymbols } from "../../utils/moderation";

export default {
    execute: async ([event, ctx]) => {
        const { nickname, userId, oldMember, serverId } = event;
        const server = await ctx.dbUtil.getServer(serverId);
        const name = nickname ?? oldMember?.username;

        // check if there's a log channel channel for message deletions
        const memberUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.member_updates);
        if (memberUpdateLogChannel) {
            // send the log channel message with the content/data of the deleted message
            await ctx.messageUtil.sendLog({
                where: memberUpdateLogChannel.channelId,
                title: `Member Nickname Changed`,
                serverId,
                description: `<@${userId}> (${inlineCode(userId)}) had their nickname changed in the server.`,
                color: Colors.blue,
                fields: [
                    {
                        name: "Nickname Changes",
                        value: `${oldMember ? (oldMember.nickname ? inlineQuote(oldMember.nickname) : "No nickname") : "Unknown nickname"} -> ${
                            nickname ? inlineQuote(nickname) : "No nickname"
                        }`,
                    },
                ],
                occurred: new Date().toISOString(),
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

            return ctx.contentFilterUtil.scanContent({
                userId,
                roleIds: member?.roleIds ?? oldMember?.roleIds ?? [],
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
