import { ModuleName, RoleType } from "@prisma/client";
import { Category, Command } from "../commands";

const descriptions: Record<ModuleName, string> = {
    [ModuleName.ECONOMY]: "Allows people to get money and climb the leaderboard.",
    [ModuleName.SHOP]: "Allows people to have, buy, sell and exchange items.",
};

const moduleList = Object.values(ModuleName);

const List: Command = {
    name: "module-list",
    subName: "list",
    description: "List the modules enabled for this server.",
    // usage: "",
    subCommand: true,
    category: Category.Custom,
    requiredRole: RoleType.ADMIN,
    execute: (message, _args, ctx, { server }) => {
        return ctx.messageUtil.replyWithEnableStateList(message, `Modules`, moduleList.filter((x) => !server.modulesDisabled.includes(x)), moduleList, descriptions);
    },
};

export default List;
