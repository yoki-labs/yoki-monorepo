import { RoleType } from "@prisma/client";
import { createCommandHandler } from "@yokilabs/bot";

import type { TuxoClient } from "../../Client";
import { useCustomIncomeCommand } from "../../commands/income/income-util";
import type { Command, GEvent, Server } from "../../typings";
import { RoleTypeValues } from "../../util/values";

const { fetchPrefix, parseCommand, fetchCommandInfo, resolveArguments, checkUserPermissions, tryExecuteCommand } = createCommandHandler<TuxoClient, Server, Command, RoleType>(
    RoleTypeValues
);

// Fetches minimod/mod/admin roles
const fetchServerRoles = (ctx: TuxoClient, serverId: string) => ctx.prisma.role.findMany({ where: { serverId } });

const fn = fetchPrefix.bind(
    null,
    parseCommand.bind(null, async (context, server, prefix, command, commandName, args) => {
        // Get all the server's custom incomes and check if any of them match the command name or ignore it
        if (typeof command === "undefined") {
            const [message, client] = context;
            const incomeByName = await client.dbUtil.getIncomeOverride(message.serverId!, void 0, commandName);

            // There is no income by that name, nor a command
            if (!incomeByName) return;

            return useCustomIncomeCommand(client, message, incomeByName);
        }

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
        if (!server.flags.includes("EARLY_ACCESS") && server.serverId !== process.env.MAIN_SERVER) return void 0;

        return fn(args, server);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;
