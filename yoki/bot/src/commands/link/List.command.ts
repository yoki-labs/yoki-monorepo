import { inlineCode } from "@yokilabs/bot";
import { Colors } from "@yokilabs/utils";

import { RoleType } from "../../typings";
import { Category, Command } from "../commands";

const List: Command = {
    name: "link-list",
    description: "Lists every link domain that is blacklisted.",
    // usage: "",
    subName: "list",
    subCommand: true,
    category: Category.Filter,
    requiredRole: RoleType.MOD,
    execute: async (message, _args, ctx, { server: { urlFilterIsWhitelist } }) => {
        const bannedUrls = await ctx.prisma.urlFilter.findMany({ where: { serverId: message.serverId! } });
        const bannedInvites = await ctx.prisma.inviteFilter.findMany({ where: { serverId: message.serverId! } });

        if (!(bannedUrls.length || bannedInvites.length)) return ctx.messageUtil.replyWithNullState(message, `No items here`, `There is nothing here to show.`);

        const bannedUrlsMapped = bannedUrls.map((x) => `\u2022 ${inlineCode(`${x.subdomain ?? ""}${x.domain}${x.route ?? ""}`)}`);
        const bannedInvitesMapped = bannedInvites.map((x) => `\u2022 ${inlineCode(x.targetServerId)}`);

        return ctx.messageUtil.replyWithEmbed(message, {
            title: `Banned links in this server`,
            color: Colors.blockBackground,
            fields: [
                {
                    name: urlFilterIsWhitelist ? `Whitelisted URLs` : `Blacklisted URLs`,
                    value: bannedUrlsMapped.length ? bannedUrlsMapped.join("\n") : "No URLs added to the list.",
                    inline: true,
                },
                {
                    name: "Whitelisted invites",
                    value: bannedInvitesMapped.length ? bannedInvitesMapped.join("\n") : "No invites added to the list.",
                    inline: true,
                },
            ],
            footer: {
                text: `${bannedUrls.length} total URLs \u2022 ${bannedInvites.length} total invites`,
            },
        });

        // return bannedUrls.length || bannedInvites.length
        //     ? ctx.messageUtil.replyWithInfo(
        //           message,
        //           `Banned links`,
        //           stripIndents`
        //             ${bannedUrls.length ? `**Blacklisted domains:** ${bannedUrls.map((url) => inlineCode(url.domain)).join(", ")}` : ""}
        //             ${bannedInvites.length ? `**Whitelisted servers:** ${bannedInvites.map((invite) => inlineCode(invite.targetServerId)).join(", ")}` : ""}
        //           `
        //       )
        //     : ctx.messageUtil.replyWithNullState(message, `No banned links`, `There are no custom banned domains or invites for this server.`);
    },
};

export default List;
