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
        return ctx.dbUtil
            .enableFilter(message.serverId!)
            .then(() => ctx.messageUtil.sendSuccessBlock(message.channelId, "Automod enabled", "Successfully enabled the automod filter for this server."))
            .catch((e: Error) =>
                ctx.messageUtil.sendCautionBlock(
                    message.channelId,
                    "An error occurred",
                    `There was an issue enabling automoderation for your server. Please forward this error to bot staff: \`${e.message}\``
                )
            );
    },
};

export default Enable;
