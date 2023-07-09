import { RoleType } from "@prisma/client";
import { createCommandHandler } from "@yokilabs/bot";

import type { TuxoClient } from "../../Client";
import { useCustomIncomeCommand } from "../../commands/income/normal-incomes";
import type { Command, GEvent, Server } from "../../typings";
import { RoleTypeValues } from "../../util/values";

const { fetchPrefix, parseCommand, fetchCommandInfo, resolveArguments, checkUserPermissions, tryExecuteCommand } = createCommandHandler<TuxoClient, Server, Command, RoleType>(
    RoleTypeValues
);

// Fetches minimod/mod/admin roles
const fetchServerRoles = (ctx: TuxoClient, serverId: string) => ctx.prisma.role.findMany({ where: { serverId } });

export default {
    execute: async (args) => {
        const [message, ctx] = args;

        if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return;

        const server = await ctx.dbUtil.getServer(message.serverId!);

        // Early access only
        if (!server.flags.includes("EARLY_ACCESS") && server.serverId !== process.env.MAIN_SERVER) return;

        const prefix = fetchPrefix(server);

        const parsed = await parseCommand([message, ctx], prefix);
        if (!parsed) return;
        let { command, commandName, args: parsedArgs } = parsed;

        if (!command) {
            const incomeByName = await ctx.dbUtil.getIncomeOverride(message.serverId!, void 0, commandName);

            // There is no income by that name, nor a command
            if (!incomeByName) return;

            return useCustomIncomeCommand(ctx, message, incomeByName);
        }

        const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
        if (!member) return;

        const canExecute = await checkUserPermissions(fetchServerRoles, [message, ctx, member], command);
        if (!canExecute) return;

        const subCommand = await fetchCommandInfo([message, ctx], prefix, command, parsedArgs);

        if (subCommand) {
            const canExecuteSub = await checkUserPermissions(fetchServerRoles, [message, ctx, member], command);
            if (!canExecuteSub) return;

            command = subCommand.command;
            parsedArgs = subCommand.args;
        }

        const resolved = await resolveArguments([message, ctx], prefix, command, parsedArgs);
        if (!resolved) return;

        // If user is capable of executing the command, it will start parsing arguments
        return tryExecuteCommand([message, ctx], server, member, prefix, command, resolved.resolvedArgs);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;
