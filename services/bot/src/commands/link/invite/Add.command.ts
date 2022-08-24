import { RoleType } from "../../../typings";
import { inlineCode } from "../../../utils/formatters";
import { isHashId } from "../../../utils/util";
import { Category } from "../../Category";
import type { Command } from "../../Command";

const Add: Command = {
    name: "link-invite-add",
    subName: "add",
    description: "Add a vanity url to the invite __whitelist__.",
    usage: "<server id>",
    examples: ["4R56dNkl"],
    subCommand: true,
    requiredRole: RoleType.ADMIN,
    category: Category.Moderation,
    args: [
        {
            name: "targetServerId",
            type: "string",
        },
    ],
    execute: async (message, args, ctx, { server }) => {
        if (!server.filterInvites)
            return ctx.messageUtil.replyWithAlert(message, `Enable invite scan`, `Invite scan is disabled! Please enable using \`${server.getPrefix()}module enable invitescan\``);
        const targetServerId = args.targetServerId as string;

        if (!isHashId(targetServerId)) return ctx.messageUtil.replyWithAlert(message, `Expected ID`, `Expected server ID, not its vanity URL.`);

        const doesExistAlready = await ctx.prisma.inviteFilter.findFirst({ where: { serverId: message.serverId!, targetServerId } });
        if (doesExistAlready) return ctx.messageUtil.replyWithAlert(message, `Already added`, `This server is already in your server's invite whitelist!`);

        await ctx.dbUtil.addInviteToFilter({
            targetServerId,
            creatorId: message.createdBy,
            serverId: message.serverId!,
        });
        return ctx.messageUtil.replyWithSuccess(message, `New server added`, `Successfully added ${inlineCode(targetServerId)} to the invite whitelist!`);
    },
};

export default Add;
