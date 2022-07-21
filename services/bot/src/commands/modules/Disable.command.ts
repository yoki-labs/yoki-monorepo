import { inlineCode } from "../../formatters";
import { RoleType } from "../../typings";
import { typeToDBPropKeys, typeToDBPropMap } from "../../util";
import { Category } from "../Category";
import type { Command } from "../Command";

const Disable: Command = {
    name: "module-disable",
    subName: "disable",
    description: "Disable a module",
    usage: `<${typeToDBPropKeys.join("|")}>`,
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    execute: async (message, args, ctx, commandCtx) => {
        const module = args.module as string;
        if (!typeToDBPropKeys.includes(module))
            return ctx.messageUtil.replyWithError(message, `The module you wish to disable must be one of the following: ${typeToDBPropKeys.map((x) => `\`${x}\``).join(", ")}`);
        return ctx.prisma.server
            .update({
                where: { id: commandCtx.server.id },
                data: { [typeToDBPropMap[module]]: false },
            })
            .then(() => ctx.messageUtil.replyWithSuccess(message, `${module} disabled`, `Successfully disabled the ${module} module for this server.`))
            .catch((e: Error) =>
                ctx.messageUtil.replyWithError(
                    message,
                    `There was an issue disabling the ${module} module for your server. Please forward this error to bot staff: ${inlineCode(e.message)}`
                )
            );
    },
};

export default Disable;
