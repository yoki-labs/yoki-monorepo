import { RoleType } from "@prisma/client";
import { createCommandHandler } from "@yokilabs/bot";

import type { TuxoClient } from "../../Client";
import type { Command, GEvent, Server } from "../../typings";
import { RoleTypeValues } from "../../util/values";

const { fetchPrefix, parseCommand, fetchCommandInfo, resolveArguments, checkUserPermissions, tryExecuteCommand } = createCommandHandler<TuxoClient, Server, Command, RoleType>(
    RoleTypeValues
);

// Fetches minimod/mod/admin roles
const fetchServerRoles = (ctx: TuxoClient, serverId: string) => ctx.prisma.role.findMany({ where: { serverId } });

const fn = fetchPrefix.bind(
    null,
    parseCommand.bind(null, (context, server, prefix, command, commandName, args) => {
        // Ignore non-existant commands
        if (typeof command === "undefined") return void 0;

        // Get the command's sub-commands, args and then execute it
        return fetchCommandInfo(
            checkUserPermissions.bind(null, resolveArguments.bind(null, tryExecuteCommand), fetchServerRoles),
            context,
            server,
            prefix,
            command,
            commandName,
            args
        );
    })
);

export default {
    execute: async (args) => {
        const [message, ctx] = args;

        if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return void 0;

        const server = await args[1].dbUtil.getServer(args[0].serverId!);

        // Early access only
        if (!server.flags.includes("EARLY_ACCESS")) return void 0;

        return fn(args, server);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;
