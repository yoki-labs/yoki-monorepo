import { IRole, createCommandHandler } from "@yokilabs/bot";

import type { TestClient } from "../../Client";
import type { Command, GEvent, Server } from "../../typings";
import { RoleType, roleTypeValues } from "../../util/fakes";

const { parseCommand, fetchCommandInfo, resolveArguments, checkUserPermissions, tryExecuteCommand } = createCommandHandler<TestClient, Server, Command, RoleType>(
    roleTypeValues
);

// Fetches minimod/mod/admin roles
const fetchServerRoles = (ctx: TestClient, serverId: string): Promise<IRole<RoleType>[]> => Promise.resolve([
    {
        serverId,
        roleId: ctx.mainServerDevRoleId,
        type: "ADMIN",
    }
]);

export default {
    execute: async (args) => {
        const [message, ctx] = args;
 
        console.log("Message content", { content: message.content, mentions: message.mentions });

        if (message.createdByWebhookId || message.authorId === ctx.user!.id || message.authorId === "Ann6LewA" || !message.serverId) return;

        const parsed = await parseCommand([message, ctx], ctx.prefix);

        if (!parsed) return;
        let { command, args: parsedArgs } = parsed;

        if (!command)
            return;

        const member = await ctx.members.fetch(message.serverId!, message.authorId).catch(() => null);
        if (!member) return;

        const canExecute = await checkUserPermissions(fetchServerRoles, [message, ctx, member], command);
        if (!canExecute) return;

        const subCommand = await fetchCommandInfo([message, ctx], ctx.prefix, command, parsedArgs);

        if (subCommand) {
            const canExecuteSub = await checkUserPermissions(fetchServerRoles, [message, ctx, member], command);
            if (!canExecuteSub) return;

            command = subCommand.command;
            parsedArgs = subCommand.args;
        }

        const resolved = await resolveArguments([message, ctx], ctx.prefix, command, parsedArgs);
        if (!resolved) return;

        // If user is capable of executing the command, it will start parsing arguments
        return tryExecuteCommand([message, ctx], { prefix: null }, member, ctx.prefix, command, resolved.resolvedArgs);
    },
    name: "messageCreated",
} satisfies GEvent<"messageCreated">;
