import { ResolvedEnum, inlineCode } from "@yokilabs/bot";

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
        const module = args.module as ResolvedEnum;
        void ctx.amp.logEvent({ event_type: "MODULE_DISABLE", user_id: message.authorId, event_properties: { serverId: message.serverId!, module: module.resolved } });

        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [module.resolved]: false },
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
