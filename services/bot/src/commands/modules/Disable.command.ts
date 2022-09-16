import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { DBPropToTypeKeys, typeToDBPropKeys, typeToDBPropMap } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Disable: Command = {
    name: "module-disable",
    subName: "disable",
    description: "Disable a module.",
    usage: `<${DBPropToTypeKeys.join("|")}>`,
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
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
                "Invalid module name",
                `The module you wish to disable must be one of the following: ${DBPropToTypeKeys.map((x) => `\`${x}\``).join(", ")}`
            );

        void ctx.amp.logEvent({ event_type: "MODULE_DISABLE", user_id: message.createdBy, event_properties: { serverId: message.serverId, module: typeToDBPropMap[module] } });
        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [typeToDBPropMap[module]]: false },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `Module disabled`, `Successfully disabled the ${inlineCode(module)} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue disabling the ${module} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Disable;
