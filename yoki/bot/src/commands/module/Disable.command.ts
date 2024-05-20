import { inlineCode, ResolvedEnum } from "@yokilabs/bot";

import { RoleType } from "../../typings";
import { typeToDBPropMap } from "../../utils/util";
import { Category, Command } from "../commands";

const Disable: Command = {
    name: "module-disable",
    subName: "disable",
    description: "Disable a Yoki module for this server.",
    // usage: `<${DBPropToTypeKeys.join("|")}>`,
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "module",
            type: "enum",
            values: typeToDBPropMap,
        },
    ],
    execute: (message, args, ctx, commandCtx) => {
        const moduleArg = args.module as ResolvedEnum;
        void ctx.amp.logEvent({ event_type: "MODULE_DISABLE", user_id: message.authorId, event_properties: { serverId: message.serverId!, module: moduleArg.resolved } });

        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [moduleArg.resolved]: false },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module disabled`, `Successfully disabled the ${inlineCode(moduleArg)} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithUnexpected(
                    message,
                    `There was an issue disabling the ${moduleArg.resolved} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Disable;
