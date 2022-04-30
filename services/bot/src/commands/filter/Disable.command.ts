import { Embed } from "@guildedjs/embeds";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Disable: Command = {
    name: "filter-disable",
    subName: "disable",
    description: "Disable the automod filter",
    usage: "",
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    execute: async (message, _args, ctx) => {
        return ctx.dbUtil
            .enableFilter(message.serverId!)
            .then(() =>
                ctx.messageUtil.send(
                    message.channelId,
                    new Embed({
                        title: "Automod disabled",
                        description: "Successfully disabled the automod filter for this server.",
                        color: ctx.messageUtil.colors.good,
                    })
                )
            )
            .catch((e: Error) =>
                ctx.messageUtil.send(
                    message.channelId,
                    new Embed({
                        title: ":x: An error occurred",
                        description: `There was an issue disabling automoderation for your server. Please forward this error to bot staff: \`${e.message}\``,
                        color: ctx.messageUtil.colors.bad,
                    })
                )
            );
    },
};

export default Disable;
