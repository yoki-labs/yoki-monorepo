import { createCommandHandler } from "@yokilabs/bot";
import type Client from "../Client";

import type { Command, RoleType, Server } from "../typings";

const { fetchPrefix, parseCommand, fetchCommandInfo, checkUserPermissions, tryExecuteCommand } = createCommandHandler<Client, Server, Command, RoleType>({ MOD: 0 });

const ChatMessageCreated = fetchPrefix.bind(
    null,
    parseCommand.bind(
        null,
        async (packet, ctx, server, prefix, command, args) => {
            // Ignore non-existant commands
            if (typeof command === "undefined") return void 0;

            // Get the command's sub-commands, args and then execute it
            return fetchCommandInfo(
                checkUserPermissions.bind(null, tryExecuteCommand, () => Promise.resolve([])),
                packet,
                ctx,
                server,
                prefix,
                command,
                args
            );
        }
    )
);

export default ChatMessageCreated;