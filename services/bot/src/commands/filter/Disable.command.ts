import { RoleType } from "../../typings";
import type { Command } from "../Command";

const Disable: Command = {
    name: "filter-disable",
    subName: "disable",
    description: "Disable the automod filter",
    usage: "",
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx) => {
        return ctx.contentFilterUtil
            .enableFilter(message.serverId!)
            .then(() => ctx.messageUtil.send(message.channelId, "Successfully disabled the automod filter for this server."))
            .catch((e: Error) =>
                ctx.messageUtil.send(message.channelId, `There was an issue disabling automoderation for your server. Please forward this error to bot staff: \`${e.message}\``)
            );
    },
};

export default Disable;
