import { inlineCode } from "@yokilabs/util";
import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { Category,Command } from "../commands";

const List: Command = {
  name: "link-list",
  description: "Lists every link domain that is blacklisted.",
  usage: "",
  subName: "list",
  subCommand: true,
  category: Category.Filter,
  requiredRole: RoleType.MOD,
  execute: async (message, _args, ctx) => {
    const bannedUrls = await ctx.prisma.urlFilter.findMany({ where: { serverId: message.serverId! } });
    const bannedInvites = await ctx.prisma.inviteFilter.findMany({ where: { serverId: message.serverId! } });

    return bannedUrls.length || bannedInvites.length
      ? ctx.messageUtil.replyWithInfo(
        message,
        `Banned links`,
        stripIndents`
                    ${bannedUrls.length ? `**Blacklisted domains:** ${bannedUrls.map((url) => inlineCode(url.domain)).join(", ")}` : ""}
                    ${bannedInvites.length ? `**Whitelisted servers:** ${bannedInvites.map((invite) => inlineCode(invite.targetServerId)).join(", ")}` : ""}
                  `
      )
      : ctx.messageUtil.replyWithNullState(message, `No banned links`, `There are no custom banned domains or invites for this server.`);
  },
};

export default List;
