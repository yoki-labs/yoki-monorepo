import { stripIndents } from "common-tags";

import { RoleType } from "../../typings";
import { inlineCode } from "../../utils/formatters";
import { DBPropToTypeKeys, DBPropToTypeMap, typeToDBPropKeys } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const List: Command = {
    name: "module-list",
    subName: "list",
    description: "List the modules enabled for this server.",
    usage: "",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    execute: async (message, _args, ctx, commandCtx) => {
        const serverDbProps = Object.keys(commandCtx.server).filter((x) => DBPropToTypeKeys.includes(x) && commandCtx.server[x]);
        const serverModules = serverDbProps.map((x) => DBPropToTypeMap[x]);

        return ctx.messageUtil.replyWithInfo(
            message,
            "Modules",
            stripIndents`
                **Enabled Modules:** ${serverModules.length ? serverModules.map(inlineCode).join(", ") : "None"}

                **Disabled Modules:** ${
                    typeToDBPropKeys
                        .filter((x) => !serverModules.includes(x))
                        .map(inlineCode)
                        .join(", ") || "None"
                }`
        );
    },
};

export default List;
