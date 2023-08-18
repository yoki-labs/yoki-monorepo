import { RoleType } from "@prisma/client";

import { Category, Command } from "../commands";
import { inlineQuote } from "@yokilabs/bot";
import { Role } from "guilded.js";

const SetGiveRole: Command = {
    name: "items-giverole",
    description: "Sets roles received when purchasing an item.",
    subName: "giverole",
    subCommand: true,
    category: Category.Economy,
    requiredRole: RoleType.MOD,
    args: [
        {
            name: "itemId",
            display: "item ID",
            type: "string",
        },
        {
            name: "role",
            display: "role ID",
            type: "role",
        },
        {
            name: "action",
            display: "remove",
            type: "string",
            optional: true,
        },
    ],
    execute: async (message, args, ctx) => {
        const itemId = args.itemId as string;
        const role = args.role as Role;
        const toRemove = (args.action as string | undefined) === "remove";

        const item = await ctx.dbUtil.getItem(message.serverId!, itemId);

        // Item needs to exist for it to be deleted
        if (!item)
            return ctx.messageUtil.replyWithError(message, "Doesn't exist", `Item with ID ${inlineQuote(itemId)} does not exist.`);

        // Can easily use XOR, but bad feedback
        const alreadyExist = item.givesRoles.includes(role.id);

        if (toRemove && !alreadyExist)
            return ctx.messageUtil.replyWithError(
                message,
                "Role not given",
                `The role <@${role.id}> is not given by the item ${inlineQuote(item.name)}.`,
                undefined,
                { isSilent: true }
            );
        else if (!toRemove && alreadyExist)
            return ctx.messageUtil.replyWithError(
                message,
                "Role already given",
                `The role <@${role.id}> is already given by the item ${inlineQuote(item.name)}.`,
                undefined,
                { isSilent: true }
            );

        // Since it would force giving out too many roles/too many requests to send
        // If there is a role already and another one needs to be added, throw an error FOR NOW
        if (item.givesRoles.length >= 1 && !toRemove)
            return ctx.messageUtil.replyWithError(message, "Too many roles", `As of now, only 1 role can be given per item to reduce ratelimiting.`);

        // Depends on action given
        const newRoleList = toRemove ? item.givesRoles.filter((x) => x !== role.id) : item.givesRoles.concat(role.id);

        await ctx.dbUtil.updateItem(item, {
            givesRoles: newRoleList
        });

        return ctx.messageUtil.replyWithSuccess(
            message,
            `Item's given role list changed`,
            `The item will ${newRoleList.length ? `now only give ${newRoleList.map((x) => `<@${x}>`).join(", ")}` : `no longer give a role`}.`,
            undefined,
            { isSilent: true }
        );
    },
};

export default SetGiveRole;
