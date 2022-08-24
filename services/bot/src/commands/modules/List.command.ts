import { RoleType } from "../../typings";
import { typeToDBPropKeys, typeToDBPropMap } from "../../utils/util";
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
        const serverDbProps = Object.keys(commandCtx.server).filter((x) => typeToDBPropKeys.includes(x));
        return ctx.messageUtil.replyWithInfo(
            message,
            "Enabled modules",
            `${serverDbProps.length ? serverDbProps.join(", ") : "**None**"}\nAvailable Modules: ${Object.keys(typeToDBPropMap).join(", ")}`
        );
    },
};

export default List;
