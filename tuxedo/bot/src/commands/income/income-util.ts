import { CommandContext, ResolvedArgs } from "@yokilabs/bot";
import { Message } from "guilded.js";
import ms from "ms";

import { TuxoClient } from "../../Client";
import { Server } from "../../typings";

export function generateIncomeCommand(commandId: string, action: string, cooldownInMs: number, max: number, min: number, successTitle: string, successDescription: string) {
    return async function execute(message: Message, _args: Record<string, ResolvedArgs>, ctx: TuxoClient, _context: CommandContext<Server>) {
        const currencies = await ctx.dbUtil.getCurrencies(message.serverId!);

        if (!currencies.length) return ctx.messageUtil.replyWithError(message, "No currencies", `This server does not have any local currencies ${action}.`);

        const lastUsed = ctx.balanceUtil.getLastCommandUsage(message.serverId!, message.createdById, commandId);

        // Need to wait 24 hours
        if (lastUsed && Date.now() - lastUsed < cooldownInMs)
            return ctx.messageUtil.replyWithError(message, "Too fast", `You have to wait ${ms(lastUsed + cooldownInMs - Date.now(), { long: true })} ${action} again.`);

        ctx.balanceUtil.updateLastCommandUsage(message.serverId!, message.createdById, commandId);

        // FIXME: Temporary solution for no config
        const reward = Math.floor(Math.random() * max + min);

        // Add to every currency
        const balanceAdded = {};
        for (const currency of currencies) balanceAdded[currency.id] = reward;

        await ctx.dbUtil.updateServerMemberBalance(message.serverId!, message.createdById, balanceAdded);

        // Reply with success
        return ctx.messageUtil.replyWithSuccess(message, successTitle, `${successDescription}, which had ${currencies.map((x) => `${reward} ${x.name}`).join(", ")}.`);
    };
}
