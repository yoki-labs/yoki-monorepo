import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { DBPropToTypeKeys, typeToDBPropKeys, typeToDBPropMap } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Enable: Command = {
    name: "module-enable",
    subName: "enable",
    description: "Enable a module for this server.",
    usage: `<${DBPropToTypeKeys.join("|")}>`,
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    args: [
        {
            name: "module",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, commandCtx) => {
        const module = args.module as string;
        if (!typeToDBPropKeys.includes(module))
            return ctx.messageUtil.replyWithAlert(
                message,
                `Invalid module name`,
                `The module you wish to enable must be one of the following: ${DBPropToTypeKeys.map((x) => `\`${x}\``).join(", ")}`
            );

        void ctx.amp.logEvent({ event_type: "MODULE_ENABLE", user_id: message.createdBy, event_properties: { serverId: message.serverId, module: typeToDBPropMap[module] } });
        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [typeToDBPropMap[module]]: true },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module enabled`, `Successfully enabled the ${inlineCode(module)} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue enabling the ${module} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
