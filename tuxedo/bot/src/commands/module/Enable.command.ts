import { ResolvedEnum, inlineCode } from "@yokilabs/bot";

import { Category, Command } from "../commands";
import { ModuleName, RoleType } from "@prisma/client";

const Enable: Command = {
    name: "module-enable",
    subName: "enable",
    description: "Enable a module for this server.",
    // usage: `<module>`,
    subCommand: true,
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "module",
            type: "enum",
            values: ModuleName,
        },
    ],
    execute: (message, args, ctx, { server }) => {
        const module = args.module as ResolvedEnum;

        // No reason to enable it if it's already enabled
        if (!server.modulesDisabled.includes(module.resolved as ModuleName))
            return ctx.messageUtil.replyWithError(message, "Already enabled", `The module ${inlineCode(module.original.toLowerCase())} is already enabled.`)

        void ctx.amp.logEvent({ event_type: "MODULE_ENABLE", user_id: message.authorId, event_properties: { serverId: message.serverId!, module: module.resolved } });

        return ctx.prisma.server
            .update({
                where: { id: server.id },
                data: { modulesDisabled: server.modulesDisabled.filter((x) => x !== module.resolved) },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module enabled`, `Successfully enabled the ${inlineCode(module.resolved)} module for this server.`));
    },
};

export default Enable;
