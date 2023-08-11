import { ResolvedEnum, inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { ModuleName, RoleType } from "@prisma/client";

const Disable: Command = {
    name: "module-disable",
    subName: "disable",
    description: "Disable a module.",
    // usage: `<${DBPropToTypeKeys.join("|")}>`,
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Custom,
    args: [
        {
            name: "module",
            // display: DBPropToTypeKeys.join(" / "),
            type: "enum",
            values: ModuleName,
        },
    ],
    execute: (message, args, ctx, { server }) => {
        const module = args.module as ResolvedEnum;

        // No reason to enable it if it's already enabled
        if (server.modulesDisabled.includes(module.resolved as ModuleName))
            return ctx.messageUtil.replyWithError(message, "Already enabled", `The module ${inlineCode(module.original.toLowerCase())} is already enabled.`)

        void ctx.amp.logEvent({ event_type: "MODULE_DISABLE", user_id: message.authorId, event_properties: { serverId: message.serverId!, module: module.resolved } });
        return ctx.prisma.server
            .update({
                where: { id: server.id },
                data: { modulesDisabled: server.modulesDisabled.concat(module.resolved as ModuleName) },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module disabled`, `Successfully disabled the ${inlineCode(module)} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithUnexpected(
                    message,
                    `There was an issue disabling the ${module} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Disable;
