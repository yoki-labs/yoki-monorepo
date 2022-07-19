import { inlineCode } from "../../formatters";
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
            .disableFilter(message.serverId!)
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Automod disabled`, `Successfully disabled the automod filter for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue disabling automoderation for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Disable;
