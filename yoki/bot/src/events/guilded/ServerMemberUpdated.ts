import { Colors, inlineCode, inlineQuote } from "@yokilabs/bot";
import { stripIndents } from "common-tags";
import { WebhookEmbed } from "guilded.js";
import { nanoid } from "nanoid";

import { FilteredContent } from "../../modules/content-filter";
import { GEvent, LogChannelType } from "../../typings";

const numberCharCodeStart = 48;
const numberCharCodeEnd = 57;
const capitalLetterCharCodeStart = 65;
const capitalLetterCharCodeEnd = 90;
const smallLetterCharCodeStart = 97;
const smallLetterCharCodeEnd = 122;

export default {
    execute: async ([event, ctx]) => {
        const { nickname, userId, oldMember, serverId } = event;
        const server = await ctx.dbUtil.getServer(serverId);

        // check if there's a log channel channel for message deletions
        const memberUpdateLogChannel = await ctx.dbUtil.getLogChannel(serverId, LogChannelType.member_updates);
        if (memberUpdateLogChannel) {
            try {
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
            } catch (e) {
                // generate ID for this error, not persisted in database
                const referenceId = nanoid();
                // send error to the error webhook
                if (e instanceof Error) {
                    console.error(e);
                    void ctx.errorHandler.send("Error in logging member leave event!", [
                        new WebhookEmbed()
                            .setDescription(
                                stripIndents`
                                    Reference ID: ${inlineCode(referenceId)}
                                    Server: ${inlineCode(serverId)}
                                    User: ${inlineCode(userId)}
                                    Error: \`\`\`
                                    ${e.stack ?? e.message}
                                    \`\`\`
                                `
                            )
                            .setColor("RED"),
                    ]);
                }
            }
        }

        // If the member's nickname is updated, scan it for any harmful content
        // Since ServerMemberUpdated doesn't provide info about user itself, even `.displayName` might not exist within it
        // Of course, the member could be fetched.
        if (nickname) {
            const firstCharCode = nickname.charCodeAt(0);

            // Some optimizations. Better than sifting through every item in array to check whether
            // the first letter is not a letter and not a number (and it's better than using Number() as well)
            // 0-9 between and including [48, 57], A-Z -- [65, 90], a-z -- [97, 122]
            if (
                firstCharCode < numberCharCodeStart ||
                (firstCharCode > numberCharCodeEnd && firstCharCode < capitalLetterCharCodeStart) ||
                (firstCharCode > capitalLetterCharCodeEnd && firstCharCode < smallLetterCharCodeStart) ||
                firstCharCode > smallLetterCharCodeEnd
            ) {
                void ctx.amp.logEvent({ event_type: "HOISTER_RENAMED_JOIN", user_id: userId, event_properties: { serverId } });
                return ctx.members.updateNickname(serverId, userId, nickname.slice(1).trim() || "NON-HOISTING NAME");
            }

            return ctx.contentFilterUtil.scanContent({
                userId,
                text: nickname,
                filteredContent: FilteredContent.ServerContent,
                channelId: null,
                server,
                resultingAction: () => ctx.members.resetNickname(serverId, userId),
            });
        }
    },
    name: "memberUpdated",
} satisfies GEvent<"memberUpdated">;
