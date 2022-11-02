import { RoleType } from "../../typings";
import { DBPropToTypeKeys, DBPropToTypeMap, typeToDBPropKeys } from "../../utils/util";
import { Category } from "../Category";
import type { Command } from "../Command";

const descriptions: Record<string, string> = {
    modmail: "Allows people to send a message to server staff.",
    antihoist: "Forces people to only have letters and numbers at the start of their names.",
    automod: "Filters out people's messages and posts.",
    antiraid: "Forces new people to use captcha and deals with raids.",
    nsfwscan: "Filters out NSFW/NSFL images from chat.",
    invitescan: "Filters out server invites and links that aren't of this server or aren't whitelisted.",
};

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

        return ctx.messageUtil.replyWithEnableStateList(message, `Modules`, serverModules, typeToDBPropKeys, descriptions);
    },
};

export default List;
