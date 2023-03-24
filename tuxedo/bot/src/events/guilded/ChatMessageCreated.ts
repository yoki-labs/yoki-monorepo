import { createCommandHandler } from "@yokilabs/bot";
import type TuxedoClient from "../../Client";

import type { Command, GEvent, RoleType, Server } from "../../typings";

const { fetchPrefix, parseCommand, fetchCommandInfo, checkUserPermissions, tryExecuteCommand } = createCommandHandler<TuxedoClient, Server, Command, RoleType>({ MOD: 0 });

const fn = fetchPrefix.bind(
    null,
    parseCommand.bind(
        null,
        async (context, server, prefix, command, args) => {
            // Ignore non-existant commands
            if (typeof command === "undefined") return void 0;

            // Get the command's sub-commands, args and then execute it
            return fetchCommandInfo(
                checkUserPermissions.bind(null, tryExecuteCommand, () => Promise.resolve([])),
                context,
                server,
                prefix,
                command,
                args
            );
        }
    )
);

export default {
    execute: async (args) => {
        const [message, ctx] = args;

        if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return void 0;

        return fn(args, await args[1].dbUtil.getServer(args[0].serverId!));
    },
    name: "messageCreated"
} satisfies GEvent<"messageCreated">;
