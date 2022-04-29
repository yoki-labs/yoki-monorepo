import Embed from "@guildedjs/embeds";

import { RoleType } from "../../typings";
import { Category } from "../Category";
import type { Command } from "../Command";

const Enable: Command = {
    name: "filter-enable",
    subName: "enable",
    description: "Enable the automod filter",
    usage: "",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx) => {
        return ctx.contentFilterUtil
            .enableFilter(message.serverId!)
            .then(() =>
                ctx.messageUtil.send(message.channelId, {
                    content: "Automod reconfigured",
                    embeds: [
                        new Embed({
                            title: ":white_check_mark: Automod enabled",
                            description: "Successfully enabled the automod filter for this server.",
                            color: ctx.messageUtil.colors.good,
                        }),
                    ],
                })
            )
            .catch((e: Error) =>
                ctx.messageUtil.send(message.channelId, {
                    content: "An error while enabling automod",
                    embeds: [
                        new Embed({
                            title: ":x: An error occurred",
                            description: `There was an issue enabling automoderation for your server. Please forward this error to bot staff: \`${e.message}\``,
                            color: ctx.messageUtil.colors.good,
                        }),
                    ],
                })
            );
    },
};

export default Enable;
