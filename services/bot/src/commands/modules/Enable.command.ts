import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { typeToDBPropKeys, typeToDBPropMap } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Enable: Command = {
    name: "module-enable",
    subName: "enable",
    description: "Enable a module for this server",
    usage: `<${typeToDBPropKeys.join("|")}>`,
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
            return ctx.messageUtil.replyWithError(message, `The module you wish to enable must be one of the following: ${typeToDBPropKeys.map((x) => `\`${x}\``).join(", ")}`);
        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [typeToDBPropMap[module]]: true },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `${module} enabled`, `Successfully enabled the ${module} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue enabling the ${module} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Enable;
