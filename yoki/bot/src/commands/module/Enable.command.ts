import { inlineCode } from "@yokilabs/bot";

import { ResolvedEnum, RoleType } from "../../typings";
import { typeToDBPropMap } from "../../utils/util";
import { Category, Command } from "../commands";

const Enable: Command = {
    name: "module-enable",
    subName: "enable",
    description: "Enable a Yoki module for this server.",
    // usage: `<module>`,
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "module",
            type: "enum",
            values: typeToDBPropMap,
        },
    ],
    execute: (message, args, ctx, commandCtx) => {
        const module = args.module as ResolvedEnum;
        void ctx.amp.logEvent({ event_type: "MODULE_ENABLE", user_id: message.authorId, event_properties: { serverId: message.serverId!, module: module.resolved } });

        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [module.resolved]: true },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module enabled`, `Successfully enabled the ${inlineCode(module.original)} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithUnexpected(
                    message,
                    `There was an issue enabling the ${module.original} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
