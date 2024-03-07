import { RoleType } from "../../typings";
import { DBPropToTypeKeys, DBPropToTypeMap, typeToDBPropKeys } from "../../utils/util";
import { Category, Command } from "../commands";

const descriptions: Record<string, string> = {
    modmail: "Allows people to send a message to the server staff.",
    antihoist: "Forces people to only have letters and numbers at the start of their names.",
    filter: "Filters out people's messages and posts.",
    antiraid: "Forces new people to use captcha and deals with raids.",
    nsfwscan: "Filters out NSFW/NSFL images from chat.",
    invitescan: "Filters out server invites and links that aren't of this server or aren't whitelisted.",
    appeals: "Allows people who were banned to appeal for an unban.",
};

const List: Command = {
    name: "module-list",
    subName: "list",
    description: "View the enabled and disabled modules for this server.",
    // usage: "",
    subCommand: true,
    category: Category.Moderation,
    requiredRole: RoleType.ADMIN,
    execute: (message, _args, ctx, commandCtx) => {
        const serverDbProps = Object.keys(commandCtx.server).filter((x) => DBPropToTypeKeys.includes(x) && commandCtx.server[x]);
        const serverModules = serverDbProps.map((x) => DBPropToTypeMap[x]);

        return ctx.messageUtil.replyWithEnableStateList(message, `Modules`, serverModules, typeToDBPropKeys, descriptions);
    },
};

export default List;
